import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile, 
  faFilePdf, 
  faFileWord, 
  faFileExcel, 
  faFilePowerpoint, 
  faFileImage, 
  faFileAlt,
  faDownload,
  faTrash,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import api from '../services/api';
import '../assets/FileUpload.css';

const DocumentList = ({ documents, onDelete, onRefresh }) => {
  // Get file icon based on file type
  const getFileIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'pdf':
        return faFilePdf;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return faFileExcel;
      case 'ppt':
      case 'pptx':
        return faFilePowerpoint;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return faFileImage;
      case 'txt':
        return faFileAlt;
      default:
        return faFile;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.delete(`/users/documents/${documentId}`, { headers });
      
      // Call the onDelete callback if provided
      if (onDelete && typeof onDelete === 'function') {
        onDelete(documentId);
      } else if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  // Handle document view/download
  const handleView = (documentPath) => {
    // Construct the full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fullUrl = `${baseUrl}${documentPath}`;
    
    // Open in a new tab
    window.open(fullUrl, '_blank');
  };

  // If no documents, show a message
  if (!documents || documents.length === 0) {
    return (
      <div className="document-list empty-list">
        <p>No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h3>Your Documents</h3>
      {documents.map((document) => (
        <div key={document._id} className="document-item">
          <div className="document-info">
            <div className="document-icon">
              <FontAwesomeIcon icon={getFileIcon(document.type)} />
            </div>
            <div className="document-details">
              <h4>{document.name}</h4>
              <p>Uploaded on {formatDate(document.uploadDate)}</p>
            </div>
          </div>
          <div className="document-actions">
            <button 
              className="document-action-btn view" 
              onClick={() => handleView(document.path)}
              title="View/Download"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button 
              className="document-action-btn delete" 
              onClick={() => handleDelete(document._id)}
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
