
FROM python:3.10-slim as builder

# Best Practice: Add gunicorn to requirements.txt instead of a separate RUN command.
# For now, this works fine.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set up a non-root user for security
RUN useradd --create-home --shell /bin/bash app_user
USER app_user
WORKDIR /home/app_user

# Create a virtual environment
RUN python -m venv /home/app_user/venv
ENV PATH="/home/app_user/venv/bin:$PATH"

# Copy requirements file and install dependencies
COPY --chown=app_user:app_user backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn 
COPY --chown=app_user:app_user backend/alembic.ini .
# Copy the directory containing all the version scripts into the WORKDIR (/app).
COPY --chown=app_user:app_user backend/alembic ./alembic

# --- Stage 2: Runner ---
# This stage creates the final, lean image using the venv from the builder.
# The paths and copy commands are corrected here to fix import errors.
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set up the same non-root user for consistency and security
RUN useradd --create-home --shell /bin/bash app_user
USER app_user

# [FIX #1] The WORKDIR is now the project root inside the container.
# This is the parent directory for your 'app' package.
WORKDIR /app

# [FIX #2] Set PYTHONPATH to the WORKDIR.
# This tells Python explicitly to look for packages starting from the /app directory.
# This is the key to making `from app.core...` work.
ENV PYTHONPATH="/app"

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder --chown=app_user:app_user /home/app_user/venv /home/app_user/venv

# Activate the virtual environment for all subsequent commands
ENV PATH="/home/app_user/venv/bin:$PATH"

# [FIX #3] Copy the application code to create the correct structure.
# We copy the local `backend/app` folder into a new folder named `app` inside the WORKDIR.
# This creates the path: `/app/app/main.py`, which allows `app.main` to be found.
COPY --chown=app_user:app_user backend/app ./app/

# [FIX #4] Copy the Gunicorn config and the ML model into the WORKDIR.
# Your CMD can now find them directly.
COPY --chown=app_user:app_user backend/app/api/gunicorn_conf.py .
COPY --chown=app_user:app_user backend/ml/models/ ./models/

COPY --chown=app_user:app_user backend/app/seed_badges.py .
COPY --chown=app_user:app_user backend/app/seed_education.py .

# Expose the port the app runs on
EXPOSE 8000

# [FIX #5] The CMD is updated to use the correct paths.
# - 'gunicorn_conf.py' is now in the root of the WORKDIR.
# - 'app.main:app' is now correctly resolved because of the PYTHONPATH and file structure.
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-c", "app/api/gunicorn_conf.py", "app.main:app"]
