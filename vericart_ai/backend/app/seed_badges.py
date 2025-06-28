import sys
from pathlib import Path

# Add the project root to the Python path
# This allows the script to find your 'app' module
sys.path.insert(0, str(Path(__file__).parent))

# --- THIS IS THE CORRECTED IMPORT ---
# We are now importing from your 'database.py' file.
from app.db.database import SessionLocal

from app.db import crud
from app.core import schemas

# The badge definitions from your service file
BADGE_DEFINITIONS_TO_SEED = [
    {"name": "First Scan", "description": "Awarded for your first successful product verification.", "icon_url": "/badges/first_scan.png"},
    {"name": "Serial Scanner", "description": "Awarded for verifying 10 products.", "icon_url": "/badges/serial_scanner.png"},
    {"name": "Authenticity Champion", "description": "Awarded for reaching 500 points.", "icon_url": "/badges/champion.png"},
]

def seed_master_badges():
    # For confirmation, check your 'database.py' file.
    # It should contain a line like: SessionLocal = sessionmaker(...)
    db = SessionLocal()
    print("Seeding master badges into the database...")
    try:
        for badge_data in BADGE_DEFINITIONS_TO_SEED:
            existing_badge = crud.get_badge_by_name(db, name=badge_data["name"])
            if existing_badge:
                print(f"- Badge '{badge_data['name']}' already exists. Skipping.")
            else:
                badge_schema = schemas.Badge(**badge_data)
                crud.create_badge(db, badge_data=badge_schema)
                print(f"+ Created badge: '{badge_data['name']}'")
        print("Seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_master_badges()