import React, { useState } from 'react';
import QuickActionModal from './QuickActionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faCheck,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import '../assets/QuickActionDemo.css';

/**
 * QuickActionDemo - A component to demonstrate the QuickActionModal functionality
 */
const QuickActionDemo = () => {
  // State for different modal types
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Processing state for buttons
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Sample form data for edit modal
  const [formData, setFormData] = useState({
    name: 'Toyota Camry',
    year: 2022,
    price: 50
  });
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle edit save
  const handleSaveEdit = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saved data:', formData);
      setIsProcessing(false);
      setShowEditModal(false);
    }, 1500);
  };
  
  // Handle delete confirm
  const handleConfirmDelete = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Deleted item');
      setIsProcessing(false);
      setShowDeleteModal(false);
    }, 1500);
  };
  
  // Handle confirm action
  const handleConfirmAction = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Action confirmed');
      setIsProcessing(false);
      setShowConfirmModal(false);
    }, 1500);
  };
  
  return (
    <div className="quick-action-demo">
      <h2>Quick Action Modals Demo</h2>
      <p>Click the buttons below to see different types of quick action modals in action.</p>
      
      <div className="quick-action-buttons">
        <button 
          className="quick-action-btn edit-btn"
          onClick={() => setShowEditModal(true)}
        >
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit Record</span>
        </button>
        
        <button 
          className="quick-action-btn delete-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete Record</span>
        </button>
        
        <button 
          className="quick-action-btn preview-btn"
          onClick={() => setShowPreviewModal(true)}
        >
          <FontAwesomeIcon icon={faEye} />
          <span>Preview Record</span>
        </button>
        
        <button 
          className="quick-action-btn confirm-btn"
          onClick={() => setShowConfirmModal(true)}
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Confirm Action</span>
        </button>
      </div>
      
      {/* Edit Modal */}
      <QuickActionModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Car Details"
        type="edit"
        onConfirm={handleSaveEdit}
        isProcessing={isProcessing}
        size="medium"
      >
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor="name">Car Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price per Day ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>
      </QuickActionModal>
      
      {/* Delete Modal */}
      <QuickActionModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Car"
        type="delete"
        onConfirm={handleConfirmDelete}
        isProcessing={isProcessing}
        size="small"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete <strong>{formData.name}</strong>?</p>
          <p>This action cannot be undone.</p>
          
          <div className="item-details">
            <p><strong>Year:</strong> {formData.year}</p>
            <p><strong>Price per Day:</strong> ${formData.price}</p>
          </div>
        </div>
      </QuickActionModal>
      
      {/* Preview Modal */}
      <QuickActionModal
        show={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Car Preview"
        type="preview"
        size="large"
      >
        <div className="preview-content">
          <div className="preview-image">
            <img src="https://via.placeholder.com/400x250" alt="Car Preview" />
          </div>
          
          <div className="preview-details">
            <h3>{formData.name}</h3>
            
            <div className="preview-info">
              <div className="info-item">
                <span className="info-label">Year:</span>
                <span className="info-value">{formData.year}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Price per Day:</span>
                <span className="info-value">${formData.price}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">Sedan</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Fuel Type:</span>
                <span className="info-value">Petrol</span>
              </div>
            </div>
            
            <div className="preview-description">
              <p>This is a preview of the car details. In a real application, this would show more comprehensive information about the car.</p>
            </div>
          </div>
        </div>
      </QuickActionModal>
      
      {/* Confirm Modal */}
      <QuickActionModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Booking"
        type="confirm"
        onConfirm={handleConfirmAction}
        isProcessing={isProcessing}
        size="small"
      >
        <div className="confirm-content">
          <p>Are you sure you want to book <strong>{formData.name}</strong>?</p>
          <p>You will be charged <strong>${formData.price}</strong> per day.</p>
        </div>
      </QuickActionModal>
    </div>
  );
};

export default QuickActionDemo;
