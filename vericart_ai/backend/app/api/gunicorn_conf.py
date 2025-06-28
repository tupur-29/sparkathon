# api/gunicorn_conf.py

# Network
bind = "0.0.0.0:8000"

# Workers
# A good starting point is (2 x $num_cores) + 1
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"

# Logging
loglevel = "info"
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
timeout = 120

# Preload the application
# This is the crucial fix for efficiency. It loads the app (and the ML models)
# ONCE in the master process before the workers are forked. This dramatically
# reduces memory usage and startup time for each worker.
preload_app = True