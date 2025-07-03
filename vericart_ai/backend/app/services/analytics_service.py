from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.db import crud, models, database
from app.core.celery_app import celery


AVERAGE_PRODUCT_VALUE = 50.0 
AVERAGE_RETURN_HANDLING_COST = 15.0 

def calculate_metrics_for_day(db: Session, target_date: date):
    """Calculates all business metrics for a given day."""
    start_datetime = target_date
    end_datetime = start_datetime + timedelta(days=1)

    
    anomaly_alerts_count = db.query(models.Alert).filter(
        models.Alert.timestamp >= start_datetime,
        models.Alert.timestamp < end_datetime
    ).count()
    losses_prevented = anomaly_alerts_count * AVERAGE_PRODUCT_VALUE

    
    returns_reduction_index = anomaly_alerts_count * AVERAGE_RETURN_HANDLING_COST

    
    total_scans = db.query(models.Scan).filter(
        models.Scan.timestamp >= start_datetime,
        models.Scan.timestamp < end_datetime
    ).count()
    authentic_scans = db.query(models.Scan).filter(
        models.Scan.timestamp >= start_datetime,
        models.Scan.timestamp < end_datetime,
        models.Scan.is_authentic == True
    ).count()
    trust_score = (authentic_scans / total_scans) * 100 if total_scans > 0 else 100.0

   

    metrics = {
        "snapshot_date": target_date,
        "estimated_losses_prevented": losses_prevented,
        "fraudulent_returns_reduction_index": returns_reduction_index,
        "customer_trust_score": round(trust_score, 2),
        "supply_chain_efficiency_score": 0.0, # Placeholder
        "raw_data": {
            "anomaly_alerts": anomaly_alerts_count,
            "total_scans": total_scans
        }
    }
    return metrics


@celery.task
def run_daily_metrics_calculation():
    """Celery task to calculate and save the previous day's metrics."""
    print("Celery Worker: Running daily metrics calculation...")
    db = database.SessionLocal()
    try:
        
        yesterday = date.today() - timedelta(days=1)
        metrics_data = calculate_metrics_for_day(db, target_date=yesterday)
        
        
        crud.create_or_update_metric_snapshot(db, data=metrics_data)
        print(f"Successfully saved metrics for {yesterday}")
    finally:
        db.close()
