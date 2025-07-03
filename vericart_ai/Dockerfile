FROM python:3.10-slim as builder


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN useradd --create-home --shell /bin/bash app_user
USER app_user
WORKDIR /home/app_user


RUN useradd --create-home --shell /bin/bash app_user
USER app_user
WORKDIR /home/app_user

RUN python -m venv /home/app_user/venv
ENV PATH="/home/app_user/venv/bin:$PATH"


COPY --chown=app_user:app_user backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn 
COPY --chown=app_user:app_user backend/alembic.ini .

COPY --chown=app_user:app_user backend/alembic ./alembic


FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN useradd --create-home --shell /bin/bash app_user
USER app_user


WORKDIR /app


ENV PYTHONPATH="/app"


COPY --from=builder --chown=app_user:app_user /home/app_user/venv /home/app_user/venv


ENV PATH="/home/app_user/venv/bin:$PATH"


COPY --chown=app_user:app_user backend/app ./app/


COPY --chown=app_user:app_user backend/app/api/gunicorn_conf.py .
COPY --chown=app_user:app_user backend/ml/models/ ./models/

COPY --chown=app_user:app_user backend/app/seed_badges.py .
COPY --chown=app_user:app_user backend/app/seed_education.py .
COPY --chown=app_user:app_user backend/app/trigger_analytics.py .
RUN chown -R app_user:app_user /app


EXPOSE 8000


CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-c", "app/api/gunicorn_conf.py", "app.main:app"]
