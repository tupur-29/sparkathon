import sys
from pathlib import Path
from datetime import date, timedelta

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the specific task function from your analytics service
from app.services.analytics_service import run_daily_metrics_calculation, calculate_metrics_for_day
from app.db import database, crud

def run_test_for_today():
    """
    Manually triggers the metric calculation for TODAY's date.
    This is for testing purposes, as the scheduled job runs for yesterday.
    """
    print("--- Manual Analytics Trigger ---")
    print("Forcing calculation for TODAY's data...")
    db = database.SessionLocal()
    try:
        today = date.today()
        metrics_data = calculate_metrics_for_day(db, target_date=today)
        
        # Save to database
        crud.create_or_update_metric_snapshot(db, data=metrics_data)
        print("\nSuccessfully calculated and saved metrics for today:")
        for key, value in metrics_data.items():
            print(f"- {key}: {value}")
    finally:
        db.close()

if __name__ == "__main__":
    # You can also use this to trigger the actual Celery task if you want to test the full Celery path
    # print("Sending task to Celery worker...")
    # run_daily_metrics_calculation.delay()
    # print("Task sent!")
    
    # For direct testing, we'll call the function directly.
    run_test_for_today()