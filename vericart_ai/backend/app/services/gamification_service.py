# backend/app/services/gamification_service.py

from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Callable, Any

from app.db import crud, models
from app.core import schemas

# ===================================================================
# Configuration Constants
# Central place to manage gamification rules.
# ===================================================================

POINTS_PER_AUTHENTIC_SCAN = 10

# ===================================================================
# Badge Eligibility Logic
# This data-driven approach makes adding new badges easy. You just
# need to add a new checker function and an entry to this list.
# ===================================================================

def _check_for_first_scan_badge(user: models.User, **kwargs) -> bool:
    """Checks if the user has made exactly one scan."""
    # We check len of point_transactions as it's the definitive record of rewarded scans.
    return len(user.point_transactions) == 1

def _check_for_ten_scans_badge(user: models.User, **kwargs) -> bool:
    """Checks if the user has made 10 or more scans."""
    return len(user.point_transactions) >= 10

def _check_for_super_scanner_badge(user: models.User, **kwargs) -> bool:
    """Checks if the user has reached 500 total points."""
    return user.points >= 500


# "Registry" of all available badges and the functions to check them.
BADGE_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "name": "First Scan",
        "checker": _check_for_first_scan_badge
    },
    {
        "name": "Serial Scanner",
        "checker": _check_for_ten_scans_badge
    },
    {
        "name": "Authenticity Champion",
        "checker": _check_for_super_scanner_badge
    }
]

# ===================================================================
# Main Service Functions
# ===================================================================

def _check_and_grant_badges(db: Session, user: models.User):
    """
    Internal helper to iterate through badge rules and award any that are earned.
    This is designed to be efficient by minimizing DB queries.
    """
    # Get a set of badge names the user has already earned for quick lookups.
    earned_badge_names = {user_badge.badge.name for user_badge in user.badges}

    for badge_def in BADGE_DEFINITIONS:
        badge_name = badge_def["name"]
        
        # Optimization: If user already has this badge, skip all checks.
        if badge_name in earned_badge_names:
            continue

        # Run the specific checker function for this badge.
        if badge_def["checker"](user=user):
            # If eligible, fetch the master badge from the DB.
            badge_to_award = crud.get_badge_by_name(db, name=badge_name)
            
            # Award the badge if it exists in the database.
            if badge_to_award:
                crud.award_badge_to_user(db, user=user, badge=badge_to_award)
                # Note: The commit is handled by the calling function.


def process_scan_for_rewards(db: Session, user: models.User, scan: models.Scan) -> Optional[schemas.ScanReward]:
    """
    The main entry point for the gamification service.
    
    This function:
    1. Awards points for a successful scan.
    2. Checks if the user has earned any new badges.
    3. Returns a reward object for the API response.
    
    IMPORTANT: This function does NOT commit the session. It should be called
    within the same transaction as the scan creation to ensure atomicity.
    """
    # Step 1: Award points for the current scan.
    crud.create_point_transaction(
        db=db,
        user=user,
        scan=scan,
        points_to_award=POINTS_PER_AUTHENTIC_SCAN
    )
    
    # Step 2: Check for any new badges the user may have earned.
    # The user object is now updated with the new points and transaction count in the session.
    _check_and_grant_badges(db=db, user=user)
    
    # Step 3: Prepare the reward information for the API response.
    reward_message = f"Authenticity confirmed! You earned {POINTS_PER_AUTHENTIC_SCAN} points."
    reward = schemas.ScanReward(
        points_awarded=POINTS_PER_AUTHENTIC_SCAN,
        message=reward_message
    )
    
    return reward