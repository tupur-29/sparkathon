

import pathlib
from pydantic_settings import BaseSettings

# Define the absolute path to the project root directory (vericart-ai/)
# This navigates up three levels from the current file's location (core -> app -> backend -> vericart-ai).
PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    """
    Manages all application settings. It automatically loads values from
    environment variables and the .env file.
    """
    # Application environment ('development', 'production', etc.)
    API_ENV: str = "development"

    # Database URL for connecting to PostgreSQL.
    DATABASE_URL: str
    
    # Absolute path to the trained machine learning model.
    MODEL_PATH: str = "/app/models/isolation_forest_v1.joblib"

    VISION_MODEL_PATH: str = "ml/models/product_image_classifier.h5"
    CLASS_MAP_PATH: str = "ml/models/class_indices.json"
    
    # Secret API Key for securing internal dashboard routes.
    API_KEY: str

    # The URL of your React frontend for CORS configuration.
    FRONTEND_URL: str

    class Config:
        # Specifies the location of the .env file relative to the project root.
        env_file = str(PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"

# Create a single, importable instance of the settings.
settings = Settings()