# backend/app/services/vision_service.py

import io
import numpy as np
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from app.core.model_handler import model_handler

# Configuration constants for the vision model
IMAGE_SIZE = (224, 224)  # The input size your model expects
CONFIDENCE_THRESHOLD = 0.85 # Minimum confidence to consider a match

class VisionService:
    """
    Handles all logic for product verification via image recognition.
    """
    def __init__(self):
        self.vision_model = model_handler.vision_model()
        self.class_names = model_handler.vision_class_names()
        if not self.vision_model or not self.class_names:
            raise RuntimeError("Vision model or class names not loaded properly.")

    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Takes raw image bytes, opens, resizes, and normalizes them for the model.
        """
        # Open the image from in-memory bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Resize to the target size required by the model
        image = image.resize(IMAGE_SIZE)
        # Convert image to a numpy array
        image_array = np.asarray(image)
        # Normalize pixel values to the [0, 1] range
        image_array = image_array / 255.0
        # Add a batch dimension (e.g., from (224, 224, 3) to (1, 224, 224, 3))
        return np.expand_dims(image_array, axis=0)

    def _postprocess_prediction(self, prediction: np.ndarray) -> dict:
        """
        Interprets the model's raw output to get the product ID and confidence.
        """
        # Get the highest probability from the prediction array
        confidence = np.max(prediction)
        # Get the index of the highest probability
        predicted_class_index = np.argmax(prediction)

        if confidence < CONFIDENCE_THRESHOLD:
            return {"product_id": None, "confidence": confidence}

        # Map the index to the actual product ID (class name)
        product_id = self.class_names[predicted_class_index]
        return {"product_id": product_id, "confidence": float(confidence)}

    async def verify_product_from_image(self, file: UploadFile) -> dict:
        """
        Orchestrates the image verification process.
        Returns a dictionary with the identified product_id and confidence score.
        """
        image_bytes = await file.read()
        
        # 1. Preprocess the image for the model
        processed_image = self._preprocess_image(image_bytes)
        
        # 2. Run prediction using the loaded model
        prediction = self.vision_model.predict(processed_image)
        
        # 3. Interpret the results
        result = self._postprocess_prediction(prediction[0]) # Get first item in batch
        
        return result