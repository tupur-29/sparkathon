from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import crud
from app.core import schemas
from app.db.database import get_db # Assuming your get_db dependency is in deps.py

# Create a new router for educational content
router = APIRouter(
    prefix="/educational-content",
    tags=["Educational Content"],
)


@router.get(
    "/categories",
    response_model=List[str],
    summary="Get a list of all available educational categories"
)
def get_available_categories(db: Session = Depends(get_db)):
    """
    Retrieve a unique, sorted list of all content categories.
    
    This is useful for a client application to build a navigation menu
    of available topics for users to browse.
    """
    categories = crud.get_all_educational_categories(db=db)
    return categories


@router.get(
    "/{category}",
    response_model=List[schemas.EducationalContent],
    summary="Get educational articles for a specific category"
)
def get_content_by_category(
    category: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """
    Retrieve a paginated list of educational articles for a given category.

    - **category**: The category of content to fetch (e.g., "electronics", "fashion").
    - **skip**: The number of items to skip for pagination.
    - **limit**: The maximum number of items to return.
    """
    # FastAPI will automatically handle the case where the category is case-sensitive.
    # You might want to convert to lower case for consistency:
    # category_lower = category.lower()
    content = crud.get_educational_content_by_category(
        db=db, category=category, skip=skip, limit=limit
    )
    
    if not content:
        # This provides a more specific error than just an empty list if desired.
        # Alternatively, you can just return the empty list `[]`.
        raise HTTPException(
            status_code=404,
            detail=f"No educational content found for category: '{category}'"
        )
        
    return content