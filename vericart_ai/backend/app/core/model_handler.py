# backend/app/core/model_handler.py
import os
import joblib
import pandas as pd
import logging
from typing import Dict, List
import json
#from tensorflow.keras.models import load_model

from app.core.config import settings

# --- Globals ---
# This will hold the loaded model in memory for the application's lifetime.
model = None
logger = logging.getLogger(__name__)

'''def load_model():
    """
    Loads the Isolation Forest model from the path specified in the settings.
    This function should be called once on application startup.
    """
    global model
    try:
        model = joblib.load(settings.MODEL_PATH)
        logger.info(f"Machine learning model loaded successfully from {settings.MODEL_PATH}")
    except FileNotFoundError:
        logger.error(f"FATAL: Model file not found at {settings.MODEL_PATH}. The application cannot start.")
        raise
    except Exception as e:
        logger.error(f"FATAL: An error occurred while loading the model: {e}")
        raise

def predict_anomaly(features: Dict) -> bool:
    """
    Takes a dictionary of engineered features, prepares them for the model,
    and returns True if the scan is an anomaly, False otherwise.
    """
    if model is None:
        logger.error("Model has not been loaded. Cannot make predictions.")
        # In a real system, this should ideally never happen if load_model is called correctly on startup.
        raise RuntimeError("Model is not available.")

    # The model was trained on a DataFrame with specific column order.
    # We must replicate that structure for prediction.
    try:
        feature_df = pd.DataFrame([features])
        model_features = ['time_diff_hours', 'distance_km', 'speed_kmh', 'scan_order']
        feature_df = feature_df[model_features]

        # The model.predict() method returns -1 for anomalies (outliers) and 1 for normal points (inliers).
        prediction = model.predict(feature_df)
        
        is_anomaly = bool(prediction[0] == -1)
        logger.info(f"Prediction for features {features}: {'Anomaly' if is_anomaly else 'Normal'}")
        
        return is_anomaly
    except Exception as e:
        logger.error(f"An error occurred during prediction: {e}")
        return True # Fail safely: If prediction fails, assume it's an anomaly.'''
class ModelHandler:
    """
    A centralized class to load, manage, and serve all machine learning models.
    This class is instantiated once as a singleton when the application starts.
    """
    def __init__(self, fraud_model_path: str, vision_model_path: str, class_map_path: str):
        self.fraud_model = self._load_joblib_model(fraud_model_path)
        self.vision_model = self._load_keras_model(vision_model_path)
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

    '''def _load_keras_model(self, path: str):
        """Loads a Keras model from an .h5 file."""
        try:
            model = load_model(path)
            logger.info(f"Computer vision model loaded successfully from {path}")
            return model
        except FileNotFoundError:
            logger.warning(f"Vision model file not found at {path}. Vision features will be disabled.")
            return None
        except Exception as e:
            logger.error(f"An error occurred while loading the vision model: {e}")
            return None'''

    def _load_class_map(self, path: str) -> List[str]:
        """Loads the vision model's class index to product ID mapping."""
        if not os.path.exists(path):
            logger.warning(f"Class map file not found at {path}. Vision features will be disabled.")
            return []
        with open(path, 'r') as f:
            class_map = json.load(f)
            # Keras prediction output corresponds to index, so we create an ordered list
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
            # Ensure column order matches the training data
            model_features = ['latitude', 'longitude', 'time_diff_seconds', 'distance_km', 'speed_kmh']
            feature_df = feature_df[model_features]
            
            prediction = self.fraud_model.predict(feature_df)
            is_anomaly = bool(prediction[0] == -1)
            logger.info(f"Prediction for features {features}: {'Anomaly' if is_anomaly else 'Normal'}")
            return is_anomaly
        except Exception as e:
            logger.error(f"An error occurred during anomaly prediction: {e}")
            return True # Fail safely: assume anomaly if prediction fails

# --- Singleton Instance ---
# This single instance will be created on app startup and imported by other services.
model_handler = ModelHandler(
    fraud_model_path=settings.MODEL_PATH,
    vision_model_path=settings.VISION_MODEL_PATH,
    class_map_path=settings.CLASS_MAP_PATH
)
