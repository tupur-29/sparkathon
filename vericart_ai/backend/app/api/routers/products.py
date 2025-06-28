'''# app/api/routers/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import crud
from app.core import schemas
from app.db.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.get_product_by_id_str(db, product_id_str=product.product_id_str)
    if db_product:
        raise HTTPException(status_code=400, detail="Product ID already registered")
    return crud.create_product(db=db, product=product)

def create_new_product(product: schemas.ProductCreate, db: Session = Depends(get_db)): # <-- Use ProductCreate
    # ... Check if supplier exists with product.supplier_id ...
    db_supplier = crud.get_supplier(db, supplier_id=product.supplier_id)
    if not db_supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Supplier with ID {product.supplier_id} not found.")

    # ... Pass the product schema to the crud function ...
    return crud.create_product(db=db, product=product)'''

# backend/app/api/routers/products.py

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
    # 1. Check if a product with this public ID already exists
    db_product = crud.get_product_by_id_str(db, product_id_str=product.product_id_str)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID '{product.product_id_str}' already exists."
        )

    # 2. Check if the supplier ID provided is valid
    db_supplier = crud.get_supplier(db, supplier_id=product.supplier_id)
    if not db_supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier with ID {product.supplier_id} not found. Cannot create product."
        )

    # 3. If all checks pass, create the product

    new_db_product = crud.create_product(db=db, product=product)
    safe_product_schema = crud.create_product_schema(new_db_product)

    # Return the safe, validated Pydantic object.
    return safe_product_schema

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a single product by its unique public-facing ID.
    """
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )
    return db_product

@router.get("/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a paginated list of all products in the system.
    """
    products = crud.get_products(db, skip=skip, limit=limit)
    return products