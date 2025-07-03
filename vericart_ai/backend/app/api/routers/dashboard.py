
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from app.core import schemas
from app.db import models, crud
from app.db.database import get_db
from app.core.security import get_api_key
from app.core.websocket_manager import manager 
from ...core.security import get_api_key_ws

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"],
    
)


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
        "highest_risk_regions": [] 
    }


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
    
    
    safe_alerts = [crud.create_alert_schema(db_alert) for db_alert in db_alerts]
    
    
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


@router.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket, api_key: str = Depends(get_api_key_ws)):
    """
    Establishes a WebSocket connection to push new alerts to the dashboard in real-time.
    Note: WebSocket dependencies require a slightly different pattern.
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() e
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected from live feed.")
