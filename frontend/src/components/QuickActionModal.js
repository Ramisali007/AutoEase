import React, { useState, useEffect } from 'react';
import '../assets/QuickActionModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faTimes,
  faEdit,
  faTrash,
  faEye,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

/**
 * QuickActionModal - A specialized modal component for quick actions like editing, confirming, or previewing
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.type - Modal type: 'edit', 'confirm', 'preview', 'custom'
 * @param {Function} props.onConfirm - Function to call when the confirm button is clicked
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {boolean} props.isProcessing - Whether an action is being processed
 * @param {string} props.size - Modal size: 'small', 'medium', 'large'
 * @param {boolean} props.closeOnBackdropClick - Whether to close the modal when clicking outside
 */
const QuickActionModal = ({
  show,
  onClose,
  title,
  children,
  type = 'custom',
  onConfirm,
  confirmText,
  cancelText,
  isProcessing = false,
  size = 'medium',
  closeOnBackdropClick = true
}) => {
  const [animateOut, setAnimateOut] = useState(false);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        handleClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  // Handle close with animation
  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setAnimateOut(false);
      onClose();
    }, 300); // Match animation duration
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Get icon based on modal type
  const getIcon = () => {
    switch (type) {
      case 'edit':
        return faEdit;
      case 'confirm':
      case 'delete':
        return faTrash;
      case 'preview':
        return faEye;
      default:
        return null;
    }
  };

  // Get default confirm text based on modal type
  const getDefaultConfirmText = () => {
    switch (type) {
      case 'edit':
        return 'Save Changes';
      case 'confirm':
        return 'Confirm';
      case 'delete':
        return 'Delete';
      case 'preview':
        return 'Close';
      default:
        return 'OK';
    }
  };

  // Get default cancel text
  const getDefaultCancelText = () => {
    return type === 'preview' ? null : 'Cancel';
  };

  // Get modal class based on type
  const getModalClass = () => {
    switch (type) {
      case 'edit':
        return 'quick-action-modal-edit';
      case 'confirm':
        return 'quick-action-modal-confirm';
      case 'delete':
        return 'quick-action-modal-delete';
      case 'preview':
        return 'quick-action-modal-preview';
      default:
        return '';
    }
  };

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'quick-action-modal-small';
      case 'large':
        return 'quick-action-modal-large';
      default:
        return 'quick-action-modal-medium';
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div 
      className={`quick-action-modal-overlay ${animateOut ? 'fade-out' : 'fade-in'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`quick-action-modal-content ${getModalClass()} ${getSizeClass()} ${animateOut ? 'slide-out' : 'slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`quick-action-modal-header ${type}`}>
          {getIcon() && (
            <div className="quick-action-modal-icon">
              <FontAwesomeIcon icon={getIcon()} />
            </div>
          )}
          <h3>{title}</h3>
          <button className="quick-action-modal-close" onClick={handleClose} title="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="quick-action-modal-body">
          {children}
        </div>
        
        <div className="quick-action-modal-footer">
          {(cancelText || getDefaultCancelText()) && (
            <button
              className="quick-action-modal-btn quick-action-modal-btn-cancel"
              onClick={handleClose}
              disabled={isProcessing}
            >
              <FontAwesomeIcon icon={faTimes} />
              <span>{cancelText || getDefaultCancelText()}</span>
            </button>
          )}
          
          {onConfirm && (
            <button
              className={`quick-action-modal-btn quick-action-modal-btn-${type}`}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={type === 'delete' ? faTrash : faCheck} />
                  <span>{confirmText || getDefaultConfirmText()}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionModal;
