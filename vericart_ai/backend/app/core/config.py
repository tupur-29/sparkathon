import pathlib
from pydantic_settings import BaseSettings


PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    """
    Manages all application settings. It automatically loads values from
    environment variables and the .env file.
    """
    
    API_ENV: str = "development"

    
    DATABASE_URL: str
    
    
    MODEL_PATH: str = "/app/models/isolation_forest_v1.joblib"

    VISION_MODEL_PATH: str = "ml/models/product_image_classifier.h5"
    CLASS_MAP_PATH: str = "ml/models/class_indices.json"
    
    
    API_KEY: str

    
    FRONTEND_URL: str

    class Config:
        
        env_file = str(PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
