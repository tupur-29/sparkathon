from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import crud, models
from app.core import schemas, security
from app.db.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user profile.
    This is typically called once when a customer first interacts with
    a VeriCart-enabled feature in the Walmart app.
    """
    db_user = crud.get_user_by_walmart_id(db, walmart_id=user.walmart_customer_id)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this Walmart ID already exists."
        )
    return crud.create_user(db=db, user=user)


@router.get("/me", response_model=schemas.User)
def read_current_user(current_user: models.User = Depends(security.get_current_active_user)):
    """
    Get the profile for the currently authenticated user.
    This endpoint is used by the mobile app to display user-specific
    information like gamification points.
    """
    return current_user
