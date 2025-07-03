import os
import joblib
import pandas as pd
import logging
from typing import Dict, List
import json


from app.core.config import settings


model = None
logger = logging.getLogger(__name__)

class ModelHandler:
    """
    A centralized class to load, manage, and serve all machine learning models.
    This class is instantiated once as a singleton when the application starts.
    """
    def __init__(self, fraud_model_path: str, vision_model_path: str, class_map_path: str):
        self.fraud_model = self._load_joblib_model(fraud_model_path)
        self.vision_class_names = self._load_class_map(class_map_path)
        logger.info("ModelHandler initialized.")

    def _load_joblib_model(self, path: str):
        """Loads a model from a .joblib file."""
        try:
            model = joblib.load(path)
            logger.info(f"Fraud detection model loaded successfully from {path}")
            return model
        except FileNotFoundError:
            logger.error(f"FATAL: Fraud model file not found at {path}.")
            raise
        except Exception as e:
            logger.error(f"FATAL: An error occurred while loading the fraud model: {e}")
            raise

    

    def _load_class_map(self, path: str) -> List[str]:
        """Loads the vision model's class index to product ID mapping."""
        if not os.path.exists(path):
            logger.warning(f"Class map file not found at {path}. Vision features will be disabled.")
            return []
        with open(path, 'r') as f:
            class_map = json.load(f)
            
            class_names = [class_map[str(i)] for i in range(len(class_map))]
            logger.info(f"Vision model class map loaded with {len(class_names)} classes.")
            return class_names

    def predict_anomaly(self, features: Dict) -> bool:
        """
        Uses the loaded Isolation Forest model to predict if a scan is an anomaly.
        """
        if self.fraud_model is None:
            raise RuntimeError("Fraud detection model is not available.")
        
        try:
            feature_df = pd.DataFrame([features])
            
            model_features = ['latitude', 'longitude', 'time_diff_seconds', 'distance_km', 'speed_kmh']
            feature_df = feature_df[model_features]
            
            prediction = self.fraud_model.predict(feature_df)
            is_anomaly = bool(prediction[0] == -1)
            logger.info(f"Prediction for features {features}: {'Anomaly' if is_anomaly else 'Normal'}")
            return is_anomaly
        except Exception as e:
            logger.error(f"An error occurred during anomaly prediction: {e}")
            return True 


model_handler = ModelHandler(
    fraud_model_path=settings.MODEL_PATH,
    vision_model_path=settings.VISION_MODEL_PATH,
    class_map_path=settings.CLASS_MAP_PATH
)
