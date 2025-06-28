

'''from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict

from app.core import schemas
from app.db import crud
from app.services import scan_processor
from app.db import models
from app.db.database import get_db
from app.core.websocket_manager import manager
from app.services.scan_processor import ScanProcessor
from app.services.vision_service import VisionService

router = APIRouter(
    prefix="/scans",
    tags=["Customer Scans & Provenance"]
)

def get_vision_service() -> VisionService:
    return VisionService()


@router.post("/verify/image", response_model=schemas.ScanVerificationResponse)
async def verify_product_by_image(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Verifies a product's authenticity by analyzing an uploaded image.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image."
        )

    # Get the prediction from the vision service
    vision_result = await vision_service.verify_product_from_image(file)
    product_id = vision_result.get("product_id")
    confidence = vision_result.get("confidence")

    if not product_id:
        return {
            "status": "Verification Failed",
            "message": f"Could not identify a valid product from the image. (Confidence: {confidence:.2f})",
            "product": None
        }

    # If a product was identified, fetch its details from the database
    db_product = crud.get_product(db, product_id=product_id)
    if not db_product:
        # This case means the model identified a product ID that isn't in our DB
        return {
            "status": "Verification Failed",
            "message": f"Product '{product_id}' identified, but not found in the database.",
            "product": None
        }

    # Log this as a scan event (optional but recommended)
    # crud.create_scan(...)

    return {
        "status": "Verified Authentic",
        "message": f"Product successfully verified via image recognition with {confidence:.2f} confidence.",
        "product": db_product
    }

@router.post("/verify", response_model=schemas.VerificationResponse)
def verify_scan(scan_request: schemas.VerificationRequest, db: Session = Depends(get_db)):
    # 1. Check if the product exists using the new CRUD function
    db_product = crud.get_product_by_id_str(db, product_id_str=scan_request.product_id_str)
    if not db_product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with ID '{scan_request.product_id_str}' not found in the VeriCart system."
        )

    # 2. Create the scan record in the database
    crud.create_scan(db=db, scan=scan_request, product_pk=db_product.id)

    # 3. (Future) Add your fraud detection logic here...

    # 4. Return a successful response using your VerificationResponse schema
    return schemas.VerificationResponse(
        status="verified",
        message="Scan recorded successfully. Analysis pending.",
        product_journey=[] # You can populate this later
    )
@router.post("/verify/product", response_model=schemas.ScanVerificationResponse)
async def verify_product(
    request: schemas.VerificationRequest,
    db: Session = Depends(get_db)
):
    """
    This is the primary endpoint for the customer-facing mobile app.
    It acts as a thin wrapper, delegating all complex logic to the 
    scan_processor service to ensure separation of concerns.
    """
    # 1. Delegate ALL business logic to the service layer.
    # The router does not create DB objects; it only passes the request data.
    processed_scan, alert = scan_processor.process_new_scan(db=db, request_data=request)

    # 2. Handle the case where the product ID from the request does not exist.
    if not processed_scan:
        raise HTTPException(
            status_code=404,
            detail=f"Product with ID '{request.product_id_str}' not found in the VeriCart system."
        )

    # 3. Broadcast the scan to the live dashboard via WebSockets.
    # We must explicitly re-query the scan with its relationships to satisfy
    # the DashboardScan schema and avoid lazy-loading issues.
    scan_for_broadcast = db.query(models.Scan).options(
        joinedload(models.Scan.product),
        joinedload(models.Scan.triggered_alert)
    ).filter(models.Scan.id == processed_scan.id).one()
    
    dashboard_schema = schemas.DashboardScan.from_orm(scan_for_broadcast)
    await manager.broadcast(dashboard_schema.model_dump_json())

    # 4. Formulate the customer-friendly response based on whether an alert was created.
    # We now explicitly return a Pydantic schema object.
    if alert:
        # The scan was an anomaly. Return a "Failed" status.
        return schemas.VerificationResponse(
            status="Failed",
            message="Verification failed. This product's digital signature is anomalous. Please contact support.",
            product_journey=[] # Return an empty list to match the schema.
        )
    else:
        # The scan was successful. Fetch the product's legitimate journey.
        # This is the only DB query this router makes, and it's for response formatting.
        journey_scans = db.query(models.Scan).filter(
            models.Scan.product_pk == processed_scan.product_pk,
            models.Scan.is_anomaly == False
        ).order_by(models.Scan.timestamp.asc()).all()
        
        return schemas.VerificationResponse(
            status="Verified",
            message="Product is authentic.",
            product_journey=journey_scans
         )
@router.get("/product/{product_id}/journey", response_model=List[schemas.Scan])
def get_product_journey(product_id: str, db: Session = Depends(get_db)):
    """
    Provides a public way to retrieve the full provenance (journey) of a
    specific product ID. This can be used by the app to show a product's
    history without needing to perform a new scan.
    """
    journey = db.query(models.Scan)\
        .filter(models.Scan.product_id == product_id, models.Scan.is_anomaly == False)\
        .order_by(models.Scan.timestamp.asc())\
        .all()
        
    if not journey:
        raise HTTPException(
            status_code=404,
            detail=f"No verified scan history found for Product ID {product_id}"
        )
        
    return journey'''
# backend/app/api/routers/scans.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.core import schemas
from app.db import crud
from app.db.database import get_db
from app.services.scan_processor import ScanProcessor
from app.services.vision_service import VisionService

router = APIRouter(
    prefix="/scans",
    tags=["Customer Scans & Provenance"]
)

# Dependency for injecting the Vision Service
def get_vision_service() -> VisionService:
    try:
        return VisionService()
    except HTTPException as e:
        # Propagate the 503 error if the vision model isn't loaded
        raise e

@router.post("/verify/nfc", response_model=schemas.VerificationResponse)
async def verify_product_by_nfc(
    request: schemas.NFCVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Primary endpoint for NFC/QR scans. It delegates all business logic
    to the ScanProcessor service for analysis and response generation.
    """
    processor = ScanProcessor(db=db)
    response_data = await processor.process_scan(request)
    return response_data

@router.post("/verify/image", response_model=schemas.VerificationResponse)
async def verify_product_by_image(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Verifies a product by image, identifies the product ID, and then
    routes it through the same core ScanProcessor for consistent analysis.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid file type.")

    # 1. Use VisionService to identify the product
    vision_result = await vision_service.verify_product_from_image(file)
    product_id = vision_result.get("product_id")
    
    if not product_id:
        return {
            "status": "Verification Failed",
            "message": "Could not identify a valid product from the image.",
            "product": None,
            "provenance": []
        }
    
    # 2. Construct a request for the core processor.
    # NOTE: Image scans lack real-time location. For anomaly detection, we use
    # placeholder coordinates. A future enhancement could use image EXIF data
    # or the phone's last known location.
    nfc_style_request = schemas.NFCVerificationRequest(
        product_id=product_id,
        latitude=0.0,
        longitude=0.0
    )

    # 3. Delegate to the same ScanProcessor for consistent logic
    processor = ScanProcessor(db=db)
    response_data = await processor.process_scan(nfc_style_request)
    return response_data

@router.get("/product/{product_id}/journey", response_model=List[schemas.ProvenanceEntry])
def get_product_journey(product_id: str, db: Session = Depends(get_db)):
    """
    Provides the full provenance (journey) of a specific product ID.
    This powers the "Digital Passport" feature in the mobile app.
    """
    journey = crud.get_provenance_for_product(db, product_id=product_id)
    if not journey:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No verified history for Product ID {product_id}")
    return journey
