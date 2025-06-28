

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from app.api.routers import scans, dashboard, products, users, suppliers, educational
from app.core.config import settings
from app.core.websocket_manager import manager
from app.db import models, database
from app.db.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on application startup
    logger.info("Starting up VeriCart AI API...")
    
    yield
    # Code to run on application shutdown
    logger.info("Shutting down VeriCart AI API...")

# --- Application Setup ---

# This command creates the database tables based on your models.py definitions
# if they don't already exist. It's a crucial step on startup.
# models.Base.metadata.create_all(bind=engine)
models.Base.metadata.create_all(bind=engine, checkfirst=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instantiate the FastAPI application
app = FastAPI(
    title="VeriCart AI Fraud Detection API",
    description="API for the Walmart Sparkathon VeriCart AI project.",
    version="1.0.0",
    lifespan=lifespan
)

# --- Middleware ---

# Configure CORS (Cross-Origin Resource Sharing) to allow your frontend
# to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    # This should be restricted to your frontend's domain in a real production environment
    allow_origins=[settings.FRONTEND_URL, "*"], # "*" is for broad testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---

# Include the routers from the api/routers directory.
# This keeps your main file clean and organizes endpoints by feature.
app.include_router(scans.router)

app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(suppliers.router)
app.include_router(educational.router)

# --- WebSocket Endpoint ---

@app.websocket("/ws/live_scans")
async def websocket_endpoint(websocket: WebSocket):
    """
    The endpoint for the dashboard to establish a persistent WebSocket connection.
    It registers the connection and then waits indefinitely until the client
    disconnects, at which point it cleans up the connection.
    """
    await manager.connect(websocket)
    try:
        while True:
            # The server waits here for a message from the client.
            # We don't need to do anything with the message, but this loop
            # is necessary to keep the connection open.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client {websocket.client} disconnected.")

# --- Root Endpoint (Health Check) ---

@app.get("/", tags=["General"])
async def root():
    """ A simple health check endpoint to confirm the API is running. """
    return {"message": "VeriCart AI API is running!"}