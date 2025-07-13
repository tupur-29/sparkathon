import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faLocationArrow, 
  faCloudUploadAlt,
  faEye
} from '@fortawesome/free-solid-svg-icons';

function ProductVerificationForm() {
  const [formData, setFormData] = useState({
    productId: 'WM-78394',
    latitude: 40.7128,
    longitude: -74.0060,
    userId: 'user_12345',
    imageFile: null
  });
  
  const [isDragging, setIsDragging] = useState(false);
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('Input', '')]: value
    }));
  };
  
  const handleVerify = () => {
    console.log('Verifying product with data:', formData);
    // Here you would typically make an API call to verify the product
  };
  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };
  
  const handleAnalyzeImage = () => {
    if (!formData.imageFile) {
      alert('Please upload an image first');
      return;
    }
    
    console.log('Analyzing image:', formData.imageFile);
    // Here you would typically make an API call to analyze the image
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Product Verification</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="productIdInput" className="block text-sm font-medium text-gray-300 mb-2">
            Product ID
          </label>
          <input
            type="text"
            id="productIdInput"
            placeholder="Enter product ID (e.g., WM-78394)"
            className="form-input"
            value={formData.productId}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitudeInput" className="block text-sm font-medium text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="number"
              id="latitudeInput"
              placeholder="40.7128"
              step="any"
              className="form-input"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="longitudeInput" className="block text-sm font-medium text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="number"
              id="longitudeInput"
              placeholder="-74.0060"
              step="any"
              className="form-input"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="userIdInput" className="block text-sm font-medium text-gray-300 mb-2">
            User ID (Optional)
          </label>
          <input
            type="text"
            id="userIdInput"
            placeholder="Enter user ID"
            className="form-input"
            value={formData.userId}
            onChange={handleChange}
          />
        </div>

        <div className="flex space-x-3">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleVerify}
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            Verify Product
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleGetLocation}
          >
            <FontAwesomeIcon icon={faLocationArrow} className="mr-2" />
            Use My Location
          </button>
        </div>

        {/* Image Verification */}
        <div className="border-t border-gray-600 pt-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Image Verification</h3>
          <div
            className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600'} rounded-lg p-6 text-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('imageUpload').click()}
          >
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="cursor-pointer">
              <FontAwesomeIcon 
                icon={faCloudUploadAlt} 
                className="text-4xl text-gray-400 mb-4" 
              />
              <p className="text-gray-300">
                {formData.imageFile 
                  ? `Selected: ${formData.imageFile.name}` 
                  : 'Click to upload or drag & drop'}
              </p>
              <p className="text-gray-500 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <button 
            className="btn btn-warning w-full mt-3"
            onClick={handleAnalyzeImage}
            disabled={!formData.imageFile}
          >
            <FontAwesomeIcon icon={faEye} className="mr-2" />
            Analyze with AI Vision
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductVerificationForm;
