# backend/app/api/routers/suppliers.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import crud, models
from app.core import schemas
from app.db.database import get_db

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)

@router.post("/", response_model=schemas.Supplier, status_code=status.HTTP_201_CREATED)
def create_new_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    """
    Create a new supplier.
    This endpoint is used by Walmart's internal teams to add new suppliers
    to the VeriCart system.
    """
    db_supplier = crud.get_supplier_by_name(db, name=supplier.name)
    if db_supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Supplier with name '{supplier.name}' already exists."
        )
    return crud.create_supplier(db=db, supplier=supplier)


@router.get("/", response_model=List[schemas.Supplier])
def read_all_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of all suppliers.
    This powers the supplier list view in the Brand Protection Dashboard,
    showing their names, locations, and calculated risk scores.
    """
    suppliers = crud.get_suppliers(db, skip=skip, limit=limit)
    return suppliers