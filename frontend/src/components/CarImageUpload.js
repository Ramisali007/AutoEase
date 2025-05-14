import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faSpinner,
  faCheck,
  faTimes,
  faImage,
  faTrash,
  faInfoCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import '../assets/FileUpload.css';

const CarImageUpload = ({
  onSuccess,
  existingImages = [],
  onRemoveImage,
  carId = null,
  required = true,
  maxImages = 10,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Reset states
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    if (!selectedFiles.length) {
      return;
    }

    // Check if adding these files would exceed the maximum
    if (existingImages.length + selectedFiles.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images. You already have ${existingImages.length}.`);
      return;
    }

    // Check file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setError(`Some files are not valid images. Allowed types: JPG, PNG, GIF, WEBP`);
      return;
    }

    // Check file sizes (max 8MB each)
    const maxSize = 8 * 1024 * 1024; // 8MB
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of 8MB`);
      return;
    }

    setFiles(selectedFiles);
    setFileNames(selectedFiles.map(file => file.name));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!files.length) {
      setError('Please select at least one image');
      return;
    }

    // Check if there are already enough images
    if (required && existingImages.length === 0 && files.length === 0) {
      setError('At least one car image is required');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    // Create form data
    const formData = new FormData();

    // If uploading to an existing car
    if (carId) {
      // Upload one image at a time
      try {
        let uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
          const singleFormData = new FormData();
          singleFormData.append('carImage', files[i]);

          // Get token from localStorage
          const token = localStorage.getItem('token');
          const headers = token ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } : { 'Content-Type': 'multipart/form-data' };

          console.log(`Uploading image ${i+1}/${files.length} for car ID: ${carId}`);

          const response = await api.post(`/host/cars/${carId}/upload-image`, singleFormData, {
            headers,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          });

          console.log(`Upload response for image ${i+1}:`, response.data);

          if (response.data && response.data.success) {
            // Add the image URL to our array
            uploadedImages.push(response.data.image);

            // Update progress
            setUploadProgress(((i + 1) / files.length) * 100);
          }
        }

        setSuccess(true);
        setUploading(false);
        setFiles([]);
        setFileNames([]);

        // Call the onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(uploadedImages);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || 'Failed to upload images');
        setUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Upload multiple images at once for a new car
      try {
        // Append all files
        files.forEach(file => {
          formData.append('carImages', file);
        });

        // Get token from localStorage
        const token = localStorage.getItem('token');
        const headers = token ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } : { 'Content-Type': 'multipart/form-data' };

        console.log(`Uploading ${files.length} images for new car`);
        console.log('Files being uploaded:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

        // Upload files
        const response = await api.post('/host/cars/upload-images', formData, {
          headers,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        });

        console.log('Upload response:', response.data);

        setSuccess(true);
        setUploading(false);
        setFiles([]);
        setFileNames([]);

        // Call the onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response.data.images);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || 'Failed to upload images');
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <div className={`car-image-upload-container ${className}`}>
      <div className="existing-images-container">
        {existingImages.length > 0 && (
          <div className="existing-images">
            <h4>Current Images ({existingImages.length})</h4>
            <div className="image-thumbnails">
              {existingImages.map((image, index) => (
                <div key={index} className="image-thumbnail-container">
                  <img
                    src={image}
                    alt={`Car image ${index + 1}`}
                    className="image-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100x75?text=Image+Error';
                    }}
                  />
                  {onRemoveImage && (existingImages.length > 1 || !required) && (
                    <button
                      className="remove-image-btn"
                      onClick={() => onRemoveImage(index)}
                      title="Remove image"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="file-input-container">
        <input
          type="file"
          id="car-image-upload"
          onChange={handleFileChange}
          className="file-input"
          disabled={uploading}
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        />
        <label htmlFor="car-image-upload" className="file-label">
          <FontAwesomeIcon icon={faImage} />
          <span>{fileNames.length ? `${fileNames.length} files selected` : 'Choose car images'}</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-info">
          <p>{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <button
        className={`upload-button ${uploading ? 'uploading' : ''} ${success ? 'success' : ''}`}
        onClick={handleUpload}
        disabled={!files.length || uploading || success}
      >
        {uploading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Uploading...</span>
          </>
        ) : success ? (
          <>
            <FontAwesomeIcon icon={faCheck} />
            <span>Uploaded</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Images</span>
          </>
        )}
      </button>

      {/* Help text */}
      <div className="upload-help-text">
        <small>
          <FontAwesomeIcon icon={faInfoCircle} /> Supported formats: JPG, PNG, GIF, WEBP. Maximum size: 8MB per image.
        </small>
      </div>
    </div>
  );
};

export default CarImageUpload;
