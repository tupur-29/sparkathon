from fastapi import WebSocket
from typing import List
import logging
from sqlalchemy.orm import Session, joinedload 
import json
import traceback
from app.db import models, crud

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages active WebSocket connections for the real-time dashboard.
    This class follows a singleton-like pattern where a single instance
    is created and imported throughout the application.
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection and adds it to the active list."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection: {websocket.client}. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection from the active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected: {websocket.client}. Total connections: {len(self.active_connections)}")

    '''async def broadcast(self, message: str):
        """Sends a JSON message to all active WebSocket connections."""
        if not self.active_connections:
            return

        # Create a list of connections to iterate over, in case of disconnections during broadcast.
        connections = list(self.active_connections)
        logger.info(f"Broadcasting message to {len(connections)} clients.")
        
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                # This can happen if a client disconnects abruptly.
                logger.warning(f"Failed to send message to {connection.client}: {e}")
                # The disconnect logic in main.py will handle final cleanup.'''
    async def broadcast(self, payload: dict):
        """Broadcasts a simple dictionary payload to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception as e:
                
                print(f"Error sending to a client: {e}")
                traceback.print_exc()



manager = ConnectionManager()
