from celery import Celery
from celery.schedules import crontab


redis_url = "redis://redis:6379/0"


celery = Celery(
    "tasks",
    broker=redis_url,
    backend=redis_url,
    include=["app.services.analytics_service"] 
)


celery.conf.beat_schedule = {
    
    'calculate-daily-metrics-task': {
        
        'task': 'app.services.analytics_service.run_daily_metrics_calculation',
        
        'schedule': crontab(hour=0, minute=5),
    },
}
