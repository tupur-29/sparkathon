from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from app.api.routers import scans, dashboard, products, users, suppliers, educational, analytics
from app.core.config import settings
from app.core.websocket_manager import manager
from app.db import models, database
from app.db.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    
    logger.info("Starting up VeriCart AI API...")
    
    yield
    
    logger.info("Shutting down VeriCart AI API...")


models.Base.metadata.create_all(bind=engine, checkfirst=True)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="VeriCart AI Fraud Detection API",
    description="API for the Walmart Sparkathon VeriCart AI project.",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    
    allow_origins=[settings.FRONTEND_URL, "*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(scans.router)

app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(suppliers.router)
app.include_router(educational.router)
app.include_router(analytics.router)



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
            
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client {websocket.client} disconnected.")



@app.get("/", tags=["General"])
async def root():
    """ A simple health check endpoint to confirm the API is running. """
    return {"message": "VeriCart AI API is running!"}
    
