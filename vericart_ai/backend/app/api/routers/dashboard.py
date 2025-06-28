
'''from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from app.core import schemas
from app.db import models
from app.db.database import get_db
from app.core.security import get_api_key

router = APIRouter(
    prefix="/dashboard",
    tags=["Internal Dashboard"],
    dependencies=[Depends(get_api_key)]  # This secures every endpoint in this file.
)

@router.get("/summary", response_model=schemas.DashboardAnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Provides the key performance indicators (KPIs) for the main dashboard overview.
    """
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    
    # Perform efficient database queries for the summary stats
    total_scans_24h = db.query(func.count(models.Scan.id)).filter(models.Scan.timestamp >= twenty_four_hours_ago).scalar()
    total_anomalies_24h = db.query(func.count(models.Scan.id)).filter(models.Scan.timestamp >= twenty_four_hours_ago, models.Scan.is_anomaly == True).scalar()
    
    # Query for top 5 riskiest products (those with the most alerts)
    highest_risk_products = db.query(models.Alert.product_id, func.count(models.Alert.id).label('count'))\
        .group_by(models.Alert.product_id)\
        .order_by(func.count(models.Alert.id).desc())\
        .limit(5).all()

    return {
        "total_scans_24h": total_scans_24h,
        "total_anomalies_24h": total_anomalies_24h,
        "highest_risk_products": [item[0] for item in highest_risk_products], # Extract just the product IDs
        "highest_risk_regions": [] # Placeholder for more complex geographic analysis
    }

@router.get("/alerts", response_model=List[schemas.Alert])
def get_all_alerts(
    status: Optional[str] = Query(None, description="Filter by status: new, investigating, resolved"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieves a paginated and filterable list of all fraud alerts.
    This powers the "Alerts Management Center" in the dashboard.
    """
    query = db.query(models.Alert)
    
    if status:
        query = query.filter(models.Alert.status == status)
        
    alerts = query.order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/alerts/{alert_id}", response_model=schemas.AlertDetail)
def get_alert_details(alert_id: int, db: Session = Depends(get_db)):
    """
    Provides a deep-dive on a single alert, including the triggering scan
    and the previous legitimate scan for comparison. This is for the
    "Alert Investigation Page".
    """
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Find the scan that triggered this alert
    triggering_scan = db.query(models.Scan).filter(models.Scan.alert_id == alert_id).first()
    
    # Find the last known *good* scan before the trigger
    previous_good_scan = db.query(models.Scan)\
        .filter(
            models.Scan.product_id == alert.product_id,
            models.Scan.timestamp < triggering_scan.timestamp,
            models.Scan.is_anomaly == False
        )\
        .order_by(models.Scan.timestamp.desc())\
        .first()

    return {
        "alert_details": alert,
        "triggering_scan": triggering_scan,
        "previous_scan": previous_good_scan
    }

@router.put("/alerts/{alert_id}/status", response_model=schemas.Alert)
def update_alert_status(
    alert_id: int,
    status_update: schemas.AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Allows an analyst to update the status of an alert (e.g., from 'new' to
    'investigating' or 'resolved').
    """
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    allowed_statuses = {"new", "investigating", "resolved", "dismissed"}
    if status_update.new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {allowed_statuses}")

    alert.status = status_update.new_status
    db.commit()
    db.refresh(alert)
    return alert'''
# backend/app/api/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from app.core import schemas
from app.db import models, crud
from app.db.database import get_db
from app.core.security import get_api_key
from app.core.websocket_manager import manager # For real-time updates
from ...core.security import get_api_key_ws

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"],
    # dependencies=[Depends(get_api_key)]  # Secures every endpoint in this file.
)

# --- Endpoint for KPIs & Summary ---
@router.get("/summary", response_model=schemas.DashboardAnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db), api_key: str = Depends(get_api_key) ):
    """
    Provides key performance indicators (KPIs) for the main dashboard overview.
    """
    stats = crud.get_dashboard_stats(db)
    
    total_scans_24h = db.query(func.count(models.Scan.id)).filter(models.Scan.timestamp >= twenty_four_hours_ago).scalar()
    
    

    return {
        "total_scans_24h": total_scans_24h or 0,
        "total_anomalies_24h": stats["total_alerts"],
        "highest_risk_products": stats["highest_risk_products"],
        "highest_risk_regions": [] # Placeholder for future geographic analysis
    }

# --- Endpoints for Alert Management ---
@router.get("/alerts", response_model=List[schemas.Alert])
def get_all_alerts(
    status: Optional[str] = Query(None, description="Filter by status: new, investigating, resolved, dismissed"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key) 
):
    """
    Retrieves a paginated and filterable list of all fraud alerts for the Alerts Management Center.
    """
    '''query = db.query(models.Alert)
    if status:
        query = query.filter(models.Alert.status == status)
    alerts = query.order_by(models.Alert.timestamp.desc()).offset(skip).limit(limit).all()
    return alerts'''
    db_alerts = crud.get_alerts(db, status=status, skip=skip, limit=limit)
    
    # 2. THIS IS THE FIX: Use a list comprehension to manually convert each
    #    SQLAlchemy object to a Pydantic schema using our safe helper function.
    safe_alerts = [crud.create_alert_schema(db_alert) for db_alert in db_alerts]
    
    # 3. Return the new list of safe, validated Pydantic objects.
    return safe_alerts

@router.get("/alerts/{alert_id}", response_model=schemas.AlertDetail)
def get_alert_details(alert_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key) ):
    """
    Provides a deep-dive on a single alert, including the triggering scan and the previous legitimate scan.
    """
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    triggering_scan = db.query(models.Scan).filter(models.Scan.id == alert.scan_id).first()
    
    previous_good_scan = db.query(models.Scan)\
        .filter(models.Scan.product_id == alert.product_id, models.Scan.timestamp < triggering_scan.timestamp, models.Scan.is_authentic == True)\
        .order_by(models.Scan.timestamp.desc()).first()

    return {"alert_details": alert, "triggering_scan": triggering_scan, "previous_scan": previous_good_scan}

@router.put("/alerts/{alert_id}/status", response_model=schemas.Alert)
def update_alert_status(alert_id: int, status_update: schemas.AlertStatusUpdate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key) ):
    """
    Allows an analyst to update the status of an alert (e.g., from 'new' to 'investigating').
    """
    alert = crud.update_alert_status(db, alert_id=alert_id, status_update=status_update)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    allowed_statuses = {"new", "investigating", "resolved", "dismissed"}
    if status_update.new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {allowed_statuses}")

    alert.status = status_update.new_status
    db.commit(); db.refresh(alert)
    safe_updated_alert = crud.create_alert_schema(alert)
    return safe_updated_alert 

# --- Endpoint for Real-Time Updates ---
@router.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket, api_key: str = Depends(get_api_key_ws)):
    """
    Establishes a WebSocket connection to push new alerts to the dashboard in real-time.
    Note: WebSocket dependencies require a slightly different pattern.
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected from live feed.")