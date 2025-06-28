'''# backend/app/db/crud.py

from sqlalchemy.orm import Session
from . import models  # Imports your SQLAlchemy models from the same 'db' directory
from app.core import schemas  # Imports your Pydantic schemas from the 'core' directory

# --- Product CRUD Functions ---

def get_product_by_id_str(db: Session, product_id_str: str) -> models.Product | None:
    """Fetches a product from the database by its public string ID (SKU/GTIN)."""
    return db.query(models.Product).filter(models.Product.product_id_str == product_id_str).first()

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    """Creates a new product record in the database."""
    # Use .model_dump() for Pydantic v2
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- Scan CRUD Functions ---

def create_scan(db: Session, scan: schemas.VerificationRequest, product_pk: int) -> models.Scan:
    """Creates a new scan record in the database, linked to a product."""
    db_scan = models.Scan(
        product_pk=product_pk,
        user_id=scan.user_id,
        latitude=scan.latitude,
        longitude=scan.longitude
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan


def get_user_by_walmart_id(db: Session, walmart_id: str):
    """Fetches a user by their unique Walmart customer ID."""
    return db.query(models.User).filter(models.User.walmart_customer_id == walmart_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Creates a new user record in the database."""
    db_user = models.User(walmart_customer_id=user.walmart_customer_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_supplier_by_name(db: Session, name: str):
    """Fetches a supplier by its unique name."""
    return db.query(models.Supplier).filter(models.Supplier.name == name).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    """Fetches a paginated list of all suppliers."""
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    """Creates a new supplier record in the database."""
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def get_provenance_for_product(db: Session, product_id: str):
    """
    Fetches the full journey for a product from the ProvenanceEntry table.
    This assumes you have the ProvenanceEntry model defined.
    """
    # Replace 'models.ProvenanceEntry' if you named it differently
    return db.query(models.ProvenanceEntry)\
        .filter(models.ProvenanceEntry.product_id == product_id)\
        .order_by(models.ProvenanceEntry.timestamp.asc())\
        .all()

def get_product(db: Session, product_id: str):
    """Fetches a single product by its public string ID."""
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    """Fetches a paginated list of all products."""
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    """
    Creates a new product record in the database from a Pydantic schema.
    """
    # The **product.dict() correctly maps fields like 'id', 'name', 'supplier_id'
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_supplier(db: Session, supplier_id: int):
    """
    Fetches a single supplier by its integer primary key.
    This is essential for validation.
    """
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()'''

# backend/app/db/crud.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from . import models
from app.core import schemas

# ===================================================================
# Product CRUD Functions
# ===================================================================

def get_product(db: Session, product_id: str) -> Optional[models.Product]:
    """Fetches a single product by its public string ID."""
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_id_str(db: Session, product_id_str: str) -> Optional[models.Product]:
    """Fetches a product from the database by its public string ID (e.g., SKU/GTIN)."""
    return db.query(models.Product).filter(models.Product.product_id_str == product_id_str).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    """Fetches a paginated list of all products."""
    return db.query(models.Product).order_by(models.Product.name).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    '''"""Creates a new product record from a Pydantic schema."""
    # Use .model_dump() for Pydantic v2, or .dict() for v1
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product'''
    """
    Creates a new product record from a Pydantic schema.
    This version uses explicit mapping to avoid kwargs ambiguity.
    """
    # Create the SQLAlchemy model instance by setting attributes one by one.
    # This is the clearest and most reliable method.
    db_product = models.Product(
        product_id_str=product.product_id_str, # Map from pydantic to SQLAlchemy
        name=product.name,
        category=product.category,
        supplier_id=product.supplier_id
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# ===================================================================
# Supplier CRUD Functions
# ===================================================================

def get_supplier(db: Session, supplier_id: int) -> Optional[models.Supplier]:
    """Fetches a single supplier by its integer primary key."""
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def get_supplier_by_name(db: Session, name: str) -> Optional[models.Supplier]:
    """Fetches a supplier by its unique name."""
    return db.query(models.Supplier).filter(models.Supplier.name == name).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Supplier]:
    """Fetches a paginated list of all suppliers."""
    return db.query(models.Supplier).order_by(models.Supplier.name).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate) -> models.Supplier:
    """Creates a new supplier record."""
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

# ===================================================================
# User CRUD Functions
# ===================================================================

def get_user_by_walmart_id(db: Session, walmart_id: str) -> Optional[models.User]:
    """Fetches a user by their unique Walmart customer ID."""
    return db.query(models.User).filter(models.User.walmart_customer_id == walmart_id).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Creates a new user record."""
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ===================================================================
# Scan & Alert CRUD Functions (Often used together)
# ===================================================================

def create_scan(db: Session, scan: schemas.ScanCreate, product_id: str, is_authentic: bool) -> models.Scan:
    """Creates a new scan record."""
    db_scan = models.Scan(
        product_id=product_id,
        latitude=scan.latitude,
        longitude=scan.longitude,
        scan_order=scan.scan_order,
        is_authentic=is_authentic
    )
    db.add(db_scan)
    # Note: Commit is handled by the calling service (ScanProcessor) to ensure transactional integrity.
    return db_scan

def create_alert(db: Session, alert: schemas.AlertCreate, scan: models.Scan) -> models.Alert:
    """Creates a new alert record, linked to a scan."""
    db_alert = models.Alert(
        product_id=scan.product_id,
        triggering_scan=scan, # This creates the relationship
        **alert.model_dump()
    )
    db.add(db_alert)
    return db_alert

def get_alerts(db: Session, status: Optional[str], skip: int, limit: int) -> List[models.Alert]:
    """Get a paginated list of alerts, filterable by status, sorted by newest."""
    query = db.query(models.Alert)
    if status:
        query = query.filter(models.Alert.status == status)
    return query.order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()

def update_alert_status(db: Session, alert_id: int, status_update: schemas.AlertStatusUpdate) -> Optional[models.Alert]:
    """Updates the status and notes of a specific alert."""
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if db_alert:
        db_alert.status = status_update.new_status
        if status_update.notes is not None:
            db_alert.notes = status_update.notes # Assuming your model has a 'notes' field
        db.commit()
        db.refresh(db_alert)
    return db_alert

# ===================================================================
# Provenance & Dashboard CRUD Functions
# ===================================================================

def get_provenance_for_product(db: Session, product_id_str: str) -> List[models.ProvenanceEntry]:
    """Fetches the full journey for a product from the ProvenanceEntry table."""
    # return db.query(models.ProvenanceEntry).filter(models.ProvenanceEntry.product_id == product_id).order_by(models.ProvenanceEntry.timestamp.asc()).all()
    product = db.query(models.Product).filter(models.Product.product_id_str == product_id_str).first()

    # Step 2: If the product doesn't exist, return an empty list immediately.
    if not product:
        return []

    # Step 3: Use the product's integer primary key (product.id) to query the provenance entries.
    # This correctly compares an Integer column to an Integer value.
    return db.query(models.ProvenanceEntry).filter(
        models.ProvenanceEntry.product_id == product.id
    ).order_by(models.ProvenanceEntry.timestamp.asc()).all()

def get_dashboard_stats(db: Session) -> dict:
    """Calculates aggregate statistics for the dashboard summary."""
    total_alerts = db.query(func.count(models.Alert.id)).scalar() or 0
    highest_risk_products_query = db.query(models.Product.name, func.count(models.Alert.id).label('count'))\
        .join(models.Alert, models.Alert.product_id == models.Product.id)\
        .group_by(models.Product.name).order_by(func.count(models.Alert.id).desc()).limit(5).all()

    return {
        "total_alerts": total_alerts,
        "highest_risk_products": [{"name": name, "count": count} for name, count in highest_risk_products_query]
    }

def create_product_schema(db_product: models.Product) -> schemas.Product:
    """Manually and explicitly builds a Pydantic Product from a DB model."""
    supplier_schema = schemas.Supplier.from_orm(db_product.supplier) if db_product.supplier else None
    
    return schemas.Product(
        id=db_product.product_id_str,
        name=db_product.name,
        category=db_product.category,
        supplier=supplier_schema
    )

def create_alert_schema(db_alert: models.Alert) -> schemas.Alert:
    """Manually and explicitly builds a Pydantic Alert from a DB model."""
    product_schema = create_product_schema(db_alert.product)
    
    return schemas.Alert(
        id=db_alert.id,
        timestamp=db_alert.timestamp,
        alert_type=db_alert.alert_type,
        message=db_alert.message,
        risk_score=db_alert.risk_score,
        status=db_alert.status,
        product=product_schema
    )

# ===================================================================
# GAMIFICATION CRUD Functions
# ===================================================================

def create_point_transaction(db: Session, user: models.User, scan: models.Scan, points_to_award: int) -> models.PointTransaction:
    """
    Creates a new point transaction record linked to a user and a specific scan.
    This also updates the user's total points count.
    
    NOTE: This function does NOT commit the session. The calling service is
    responsible for the commit to ensure the entire operation (e.g., scan + points)
    is transactional.
    """
    # Step 1: Create the transaction record for auditing purposes.
    db_point_transaction = models.PointTransaction(
        owner=user,
        scan=scan,
        points_awarded=points_to_award
    )
    db.add(db_point_transaction)
    
    # Step 2: Update the user's cached total points for fast retrieval.
    user.points += points_to_award
    db.add(user) # Add the updated user object to the session
    
    return db_point_transaction


def create_badge(db: Session, badge_data: schemas.Badge) -> models.Badge:
    """
    Creates a new master badge definition. This is typically an admin action.
    """
    db_badge = models.Badge(**badge_data.model_dump())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge


def get_badge_by_name(db: Session, name: str) -> Optional[models.Badge]:
    """Fetches a master badge definition by its unique name."""
    return db.query(models.Badge).filter(models.Badge.name == name).first()


def award_badge_to_user(db: Session, user: models.User, badge: models.Badge) -> Optional[models.UserBadge]:
    """
    Awards a badge to a user by creating a UserBadge entry.
    Checks if the user already has the badge to prevent duplicates.

    NOTE: Does NOT commit the session, to be handled by the calling service.
    """
    # Check if the user already has this badge
    existing_user_badge = db.query(models.UserBadge).filter(
        models.UserBadge.user_id == user.id,
        models.UserBadge.badge_id == badge.id
    ).first()

    if existing_user_badge:
        return None # Return None to indicate no new badge was awarded

    # If they don't have it, create the link
    db_user_badge = models.UserBadge(user=user, badge=badge)
    db.add(db_user_badge)
    
    return db_user_badge


def create_educational_content(db: Session, content: schemas.EducationalContentCreate) -> models.EducationalContent:
    """
    Creates a new educational content article in the database.
    This is intended for use by a seeding script or an admin panel.
    """
    db_content = models.EducationalContent(**content.model_dump())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


def get_educational_content_by_category(db: Session, category: str, skip: int = 0, limit: int = 20) -> List[models.EducationalContent]:
    """
    Fetches a paginated list of educational articles for a specific category.
    """
    return db.query(models.EducationalContent)\
        .filter(models.EducationalContent.category == category)\
        .order_by(models.EducationalContent.title)\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_all_educational_categories(db: Session) -> List[str]:
    """
    Fetches a unique list of all available educational content categories.
    This is useful for the UI to build a navigation menu.
    """
    # The query returns a list of tuples, e.g., [('electronics',), ('fashion',)]
    # We use a list comprehension to flatten it into a simple list of strings.
    result_tuples = db.query(models.EducationalContent.category).distinct().order_by(models.EducationalContent.category).all()
    return [category for (category,) in result_tuples]
