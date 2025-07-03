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


def get_vision_service() -> VisionService:
    try:
        return VisionService()
    except HTTPException as e:
        
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

    
    vision_result = await vision_service.verify_product_from_image(file)
    product_id = vision_result.get("product_id")
    
    if not product_id:
        return {
            "status": "Verification Failed",
            "message": "Could not identify a valid product from the image.",
            "product": None,
            "provenance": []
        }
    
    
    nfc_style_request = schemas.NFCVerificationRequest(
        product_id=product_id,
        latitude=0.0,
        longitude=0.0
    )

    
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
