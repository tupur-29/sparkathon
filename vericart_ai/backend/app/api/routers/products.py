from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import crud
from app.core import schemas
from app.db.database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.post("/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Creates a new product in the system.

    - Validates that the product ID is unique.
    - Validates that the specified supplier exists before creation.
    """
    
    db_product = crud.get_product_by_id_str(db, product_id_str=product.product_id_str)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID '{product.product_id_str}' already exists."
        )

    
    db_supplier = crud.get_supplier(db, supplier_id=product.supplier_id)
    if not db_supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier with ID {product.supplier_id} not found. Cannot create product."
        )

    

    new_db_product = crud.create_product(db=db, product=product)
    safe_product_schema = crud.create_product_schema(new_db_product)

    
    return safe_product_schema



@router.get("/{product_id_str}", response_model=schemas.Product, summary="Get Product Details with Social Proof")
def read_product(product_id_str: str, db: Session = Depends(get_db)):
    """
    Retrieves details for a single product by its unique public-facing string ID,
    now including social proof verification statistics.
    """
    db_product = crud.get_product_by_id_str(db, product_id_str=product_id_str)
    
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id_str}' not found."
        )

    
    stats_data = crud.get_product_verification_stats(db, product_id=db_product.id)
    total = stats_data["total_scans"]
    authentic = stats_data["authentic_scans"]
    
    if total > 0:
        percentage = round((authentic / total) * 100, 1)
    else:
        percentage = 100.0

    verification_stats_obj = schemas.ProductVerificationStats(
        total_scans=total,
        authentic_scans=authentic,
        authenticity_percentage=percentage
    )

    
    product_response = schemas.Product(
        
        id=db_product.product_id_str, 
        name=db_product.name,
        category=db_product.category,
        
        supplier=schemas.Supplier.from_orm(db_product.supplier) if db_product.supplier else None,
        
        verification_stats=verification_stats_obj
    )
    
    return product_response

@router.get("/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a paginated list of all products in the system.
    """
    products = crud.get_products(db, skip=skip, limit=limit)
    return products
