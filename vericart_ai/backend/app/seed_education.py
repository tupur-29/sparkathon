import sys
from pathlib import Path

# Add the project root to the Python path to allow imports from 'app'
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import SessionLocal
from app.db import crud, models
from app.core import schemas

# Define the educational content to be seeded into the database.
# Using Markdown for the content is a good practice for simple formatting.
EDUCATIONAL_CONTENT_TO_SEED = [
    {
        "category": "electronics",
        "title": "How to Spot Fake Chargers and Cables",
        "content": """
# Spotting Fake Electronics Accessories

Counterfeit chargers and cables can be dangerous and damage your devices. Here’s what to look for:

1.  **Check the Packaging:** Look for high-quality printing, correct logos, and a professional finish. Typos or blurry images are a major red flag.
2.  **Examine the Product:** Authentic products have a solid feel. Check for misaligned seams, cheap plastic, or incorrect USB port colors.
3.  **Verify Markings:** Look for legitimate safety certification marks (like UL, CE). Counterfeits often have fake or poorly printed markings.
4.  **Test the Weight:** Often, genuine products are heavier than fakes due to higher-quality components.
"""
    },
    {
        "category": "electronics",
        "title": "Verifying High-End Headphones",
        "content": """
# Checking Authenticity of Premium Headphones

Premium headphones are a common target for counterfeiters.

*   **Serial Number:** Check the serial number on the product and packaging with the manufacturer's official website.
*   **Sound Quality:** This is the biggest giveaway. Fakes will have poor bass, tinny highs, and a lack of clarity compared to the real deal.
*   **Build Quality & Materials:** Feel the materials. Real products use premium metals, leather, and plastics. Fakes will feel cheap and flimsy.
"""
    },
    {
        "category": "fashion",
        "title": "Tips for Identifying Authentic Handbags",
        "content": """
# How to Spot a Fake Designer Handbag

Protect your investment by checking these details:

1.  **Stitching:** Authentic bags have perfectly even, straight, and clean stitching. Sloppy, angled, or frayed stitches are a sign of a fake.
2.  **Hardware:** Zippers, clasps, and logos should be heavy and high-quality. Check for correct engravings and brand marks.
3.  **Logo & Branding:** Examine the brand logo font, spacing, and spelling with extreme care. This is where fakes often make mistakes.
4.  **Materials:** Whether it's leather or canvas, the material should feel and smell authentic. A chemical or plastic smell is a bad sign.
"""
    }
]

def seed_educational_content():
    """
    Connects to the database and seeds the educational_content table.
    This script is idempotent - it will not create duplicates if run again.
    """
    db = SessionLocal()
    print("Seeding educational content into the database...")
    try:
        for content_data in EDUCATIONAL_CONTENT_TO_SEED:
            # Idempotency check: see if an article with this title already exists.
            existing_content = db.query(models.EducationalContent).filter(models.EducationalContent.title == content_data["title"]).first()
            
            if existing_content:
                print(f"- Content '{content_data['title']}' already exists. Skipping.")
            else:
                # Create a Pydantic schema from the dict
                content_schema = schemas.EducationalContentCreate(**content_data)
                # Use the CRUD function to create it in the DB
                crud.create_educational_content(db, content=content_schema)
                print(f"+ Created content: '{content_data['title']}'")
        
        print("\nEducational content seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_educational_content()