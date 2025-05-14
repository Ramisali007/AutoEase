import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import '../assets/FileUpload.css';

const FileUpload = ({ 
  endpoint, 
  fileType = 'file', 
  maxSize = 5, 
  allowedTypes = [], 
  onSuccess, 
  buttonText = 'Upload File',
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
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
    const selectedFile = e.target.files[0];
    
    // Reset states
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    
    if (!selectedFile) {
      setFile(null);
      setFileName('');
      return;
    }

    // Check file size (convert maxSize from MB to bytes)
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSize}MB`);
      setFile(null);
      setFileName('');
      return;
    }

    // Check file type if allowedTypes is provided
    if (allowedTypes.length > 0) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        setFile(null);
        setFileName('');
        return;
      }
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    // Create form data
    const formData = new FormData();
    formData.append(fileType, file);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } : {
        'Content-Type': 'multipart/form-data'
      };

      // Upload file with progress tracking
      const response = await api.post(endpoint, formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setSuccess(true);
      setUploading(false);
      
      // Call the onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <div className="file-input-container">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          className="file-input"
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="file-label">
          <FontAwesomeIcon icon={faUpload} />
          <span>{fileName || 'Choose a file'}</span>
        </label>
      </div>

      {file && (
        <div className="file-info">
          <p>File: {file.name}</p>
          <p>Size: {formatFileSize(file.size)}</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}

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
        disabled={!file || uploading || success}
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
            <span>{buttonText}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FileUpload;
