

from fastapi import Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db import crud, models
from app.db.database import get_db
from starlette.websockets import WebSocket
from starlette.exceptions import WebSocketException
from starlette import status

# Import the settings instance from your config file.
from app.core.config import settings

# Define the header where the API key is expected. "X-API-Key" is a common standard.
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key_from_request: str = Security(api_key_header)):
    """
    A FastAPI dependency that checks for a valid API key in the request headers.

    Raises:
        HTTPException(401): If the API key is missing or invalid.
    """
    # Compare the key from the request header with the key stored in our settings.
    if api_key_from_request == settings.API_KEY:
        return api_key_from_request
    else:
        # If the keys do not match, or if no key was provided, deny access.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Missing API Key"
        )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # "token" is a placeholder URL

def get_current_active_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency to get the current user from a token.
    In a real application, this would decode a JWT token to get the user ID.
    For this example, we'll assume the token *is* the walmart_customer_id.
    """
    # --- START MOCK AUTHENTICATION ---
    # In a real app, you would replace this block with JWT decoding:
    # try:
    #     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    #     walmart_id: str = payload.get("sub")
    #     if walmart_id is None:
    #         raise credentials_exception
    # except JWTError:
    #     raise credentials_exception
    walmart_id = token  # Simple mock: treat the token itself as the ID
    # --- END MOCK AUTHENTICATION ---

    user = crud.get_user_by_walmart_id(db, walmart_id=walmart_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_api_key_ws(websocket: WebSocket):
    """
    A dependency to authenticate WebSockets by checking the 'x-api-key' header.
    This version manually inspects the WebSocket headers and has no other dependencies.
    """
    api_key = websocket.headers.get("x-api-Key")

    # Use the same secret key as your HTTP endpoints
    if api_key == "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08":
        return api_key # Success
    else:
        # Raise a specific WebSocketException. FastAPI/Starlette will catch this
        # and close the connection with the specified code and reason.
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Invalid API Key"
        )