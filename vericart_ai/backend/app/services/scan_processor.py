'''# backend/app/services/scan_processor.py

from sqlalchemy.orm import Session
from datetime import datetime
from haversine import haversine, Unit

from app.db import models
from app.core import schemas
from app.core.model_handler import model_handler # Assuming model_handler.py is in the app/ directory
from app.core.websocket_manager import manager

def process_new_scan(db: Session, request_data: schemas.VerificationRequest):
    """
    Handles the entire business logic for processing a single product scan.
    
    Returns a tuple of (processed_scan_object, created_alert_object | None).
    """
    # 1. Look up the product being scanned.
    product = db.query(models.Product).filter(
        models.Product.product_id_str == request_data.product_id_str
    ).first()

    if not product:
        # If the product doesn't exist in our system, we cannot process the scan.
        return None, None

    # 2. Find the most recent *legitimate* scan for this product to compare against.
    previous_scan = db.query(models.Scan).filter(
        models.Scan.product_pk == product.id,
        models.Scan.is_anomaly == False
    ).order_by(models.Scan.timestamp.desc()).first()

    # 3. Engineer features for the machine learning model.
    scan_order = (previous_scan.scan_order + 1) if previous_scan else 1
    features = {
        'time_diff_hours': 0,
        'distance_km': 0,
        'speed_kmh': 0,
        'scan_order': scan_order
    }

    if previous_scan:
        time_diff = (datetime.utcnow() - previous_scan.timestamp.replace(tzinfo=None)).total_seconds() / 3600.0
        distance = haversine(
            (previous_scan.latitude, previous_scan.longitude),
            (request_data.latitude, request_data.longitude),
            unit=Unit.KILOMETERS
        )
        speed = distance / time_diff if time_diff > 0 else 0
        
        features.update({
            'time_diff_hours': time_diff,
            'distance_km': distance,
            'speed_kmh': speed,
        })

    # 4. Get a prediction from the Isolation Forest model.
    is_anomaly = model_handler.predict_anomaly(features)
    
    # 5. Create and save the new scan record.
    new_scan = models.Scan(
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        user_id=request_data.user_id,
        is_anomaly=is_anomaly,
        scan_order=features['scan_order'],
        product_pk=product.id
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # 6. If it's an anomaly, create and save a corresponding Alert record.
    alert = None
    if is_anomaly:
        alert_type = "Velocity" if features['speed_kmh'] > 900 else "Geographic"
        alert = models.Alert(
            product_pk=product.id,
            triggering_scan_pk=new_scan.id,
            alert_type=alert_type,
            risk_score=round(features.get('speed_kmh', 0) / 100, 2), # Example risk score
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
    return new_scan, alert'''
# backend/app/services/scan_processor.py

from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from haversine import haversine, Unit
import logging
import asyncio
import json
from app.db import models, crud
from app.core import schemas
from app.core.model_handler import model_handler
from app.core.websocket_manager import manager
from app.services import gamification_service

logger = logging.getLogger(__name__)

class ScanProcessor:
    """
    A service class encapsulating all business logic for processing a product scan.
    This structure is more scalable and testable than a standalone function.
    """
    def __init__(self, db: Session):
        self.db = db

    def _engineer_features(self, request_data: schemas.NFCVerificationRequest, product_id: str) -> dict:
        """Helper method to create features for the ML model."""
        previous_scan = self.db.query(models.Scan).filter(
            models.Scan.product_id == product_id,
            models.Scan.is_authentic == True
        ).order_by(models.Scan.timestamp.desc()).first()

        scan_order = (previous_scan.scan_order + 1) if previous_scan else 1
        features = {'latitude': request_data.latitude,
        'longitude': request_data.longitude,'time_diff_seconds': 0, 'distance_km': 0, 'speed_kmh': 0}

        if previous_scan:
            time_diff = (datetime.now(timezone.utc) - previous_scan.timestamp).total_seconds()
            time_diff_hours = time_diff / 3600.0 if time_diff > 0 else float('inf')
            distance = haversine(
                (previous_scan.latitude, previous_scan.longitude),
                (request_data.latitude, request_data.longitude),
                unit=Unit.KILOMETERS
            )
            speed = distance / time_diff_hours if time_diff_hours > 0 else 0
            
            features.update({'time_diff_seconds': time_diff, 'distance_km': distance, 'speed_kmh': speed})
        
        return features

    async def process_scan(self, request_data: schemas.NFCVerificationRequest) -> dict:
        """
        Asynchronously processes a scan, runs it through the AI, updates the DB,
        and broadcasts alerts if necessary.
        """
        def create_product_schema(db_product: models.Product) -> schemas.Product:
    # First, handle the nested supplier object correctly
                supplier_schema = None
                if db_product.supplier:
                    # Use from_orm for the non-conflicted Supplier model
                    supplier_schema = schemas.Supplier.from_orm(db_product.supplier)
                
                # Now, manually and explicitly build the Product schema
                return schemas.Product(
                    id=db_product.product_id_str,  # Source: the string ID from the DB
                    name=db_product.name,
                    category=db_product.category,
                    supplier=supplier_schema
                )
        def create_alert_schema(db_alert: models.Alert) -> schemas.Alert:
                """Manually and explicitly builds a Pydantic Alert from a DB model."""
    # 1. Manually handle the conflicted nested 'product' object by calling our helper.
                product_schema = create_product_schema(db_alert.product)
                
                # 2. Manually build the top-level Alert schema.
                return schemas.Alert(
                    id=db_alert.id,
                    timestamp=db_alert.timestamp,
                    alert_type=db_alert.alert_type,
                    message=db_alert.message,
                    risk_score=db_alert.risk_score,
                    status=db_alert.status,
                    product=product_schema  # Use the safely-built product schema
                )
        # product = self.db.query(models.Product).filter(
            # models.Product.product_id_str == request_data.product_id
        # ).first()
        product = self.db.query(models.Product).options(
            joinedload(models.Product.supplier)
        ).filter(
            models.Product.product_id_str == request_data.product_id
        ).first()

        if not product:
            logger.warning(f"Scan attempt for non-existent product ID: {request_data.product_id}")
            return {"status": "Verification Failed", "message": "Product ID not found.", "product": None}
        
        user = None
        # NOTE: Your NFCVerificationRequest has user_id as an int, but your User model uses a string walmart_customer_id.
        # We will assume the request should contain the string ID for this to work with your existing `crud.get_user_by_walmart_id`.
        if request_data.user_id:
            user = crud.get_user_by_walmart_id(self.db, walmart_id=request_data.user_id)
            if not user:
                logger.warning(f"Scan processed for a user ID that does not exist: {request_data.user_id}")

        # 1. Engineer features and get AI prediction
        features = self._engineer_features(request_data, product.id)
        is_anomaly = model_handler.predict_anomaly(features)
        
        # 2. Create the new Scan record
        new_scan = models.Scan(
            product_id=product.id,
            latitude=request_data.latitude,
            longitude=request_data.longitude,
            is_authentic=(not is_anomaly), # Set authenticity based on prediction
            user_id=user.walmart_customer_id if user else None
            # user_id can be added here if available in request_data
        )
        self.db.add(new_scan)
        
        
        # 3. If it's an anomaly, create a corresponding Alert
        if is_anomaly:
            speed = features.get('speed_kmh', 0)
            alert_type = "Velocity" if speed > 900 else "Geographic"
            
            # More robust risk scoring
            risk_score = min(99, int((speed / 1200) * 100)) if speed > 100 else 20
            
            new_alert = models.Alert(
                product_id=product.id,
                alert_type=alert_type,
                message=f"{alert_type} anomaly detected for {product.name}.",
                risk_score=risk_score,
                status="new",
                triggering_scan=new_scan # This creates the relationship
            )
            self.db.add(new_alert)
            
            # Use a single, transactional commit for all DB changes
            self.db.commit()
            self.db.refresh(new_alert) # Refresh to get the ID and defaults
            
            # 4. Broadcast the new alert to all connected dashboard clients
            # alert_schema = schemas.Alert.from_orm(new_alert)
            live_alert = self.db.query(models.Alert).options(
        joinedload(models.Alert.product).joinedload(models.Product.supplier)
    ).filter(models.Alert.id == new_alert.id).one()
            safe_alert_schema = create_alert_schema(live_alert)
            alert_json_string = safe_alert_schema.model_dump_json(by_alias=True)
            alert_dict = json.loads(alert_json_string)
            
            await manager.broadcast({"type": "new_alert", "payload": alert_dict})
            product_schema = create_product_schema(product)
            
            logger.info(f"Anomaly detected and alert created: {new_alert.id}")
            return schemas.VerificationResponse(
        status="Verification Failed",
        message=safe_alert_schema.message,
        product=product_schema, # Pass the manually built, correct object
        provenance=[]
    )
            # return {"status": "Verification Failed", "message": new_alert.message, "product": product,  "provenance": []}
        else:
            reward = None
            if user:
                # If the scan is authentic and performed by a known user, process rewards.
                # This happens BEFORE the commit to ensure it's part of the transaction.
                reward = gamification_service.process_scan_for_rewards(
                    db=self.db, user=user, scan=new_scan
                )
            # Commit the legitimate scan
            self.db.commit()
            provenance_entries = crud.get_provenance_for_product(self.db, product_id_str=product.product_id_str)
            logger.info(f"Legitimate scan processed for product ID: {product.product_id_str}")
            product_schema = create_product_schema(product)

            return schemas.VerificationResponse(
        status="Verified Authentic",
        message="Product authenticity confirmed.",
        product=product_schema, # Pass the manually built, correct object
        provenance=provenance_entries,
        reward=reward
    )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            # return {"status": "Verified Authentic", "message": "Product authenticity confirmed.", "product": product, "provenance": provenance_entries}
        