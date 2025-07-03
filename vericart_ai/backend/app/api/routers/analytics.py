from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.db import crud, models
from app.core import schemas
from app.db.database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
    
)

@router.get("/metrics", response_model=List[schemas.BusinessMetricSnapshot])
def get_business_metrics(
    start_date: date = None,
    end_date: date = date.today(),
    db: Session = Depends(get_db)
):
    """
    Retrieve pre-calculated business impact metrics for a date range.
    Defaults to the last 30 days.
    """
    if start_date is None:
        start_date = end_date - timedelta(days=30)
        
    query = db.query(models.BusinessMetricSnapshot).filter(
        models.BusinessMetricSnapshot.snapshot_date >= start_date,
        models.BusinessMetricSnapshot.snapshot_date <= end_date
    ).order_by(models.BusinessMetricSnapshot.snapshot_date.desc())
    
    return query.all()
