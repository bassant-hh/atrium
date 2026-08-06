import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { removeRole } from '../../../utils/role';
import { ROUTES } from '../../../constants/routes';
import './SwitchAccountModal.css';

const SwitchAccountModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const continueButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Store previously focused element and focus modal when opened
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      setIsSubmitting(false);
      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key press and focus trap inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = [cancelButtonRef.current, continueButtonRef.current].filter(
          Boolean,
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onClose();
    logout();
    removeRole();
    navigate(ROUTES.PORTAL, { replace: true, state: null });
  };

  return (
    <div className="switch-modal-overlay" onClick={handleBackdropClick} aria-hidden="false">
      <div
        ref={modalRef}
        className="switch-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-modal-title"
        aria-describedby="switch-modal-desc"
        tabIndex={-1}
      >
        <h3 id="switch-modal-title" className="switch-modal-title">
          Switch account?
        </h3>
        <p id="switch-modal-desc" className="switch-modal-desc">
          You will be signed out before choosing another account type.
        </p>

        <div className="switch-modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="switch-modal-btn-cancel"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            ref={continueButtonRef}
            type="button"
            className="switch-modal-btn-continue"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Switching...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchAccountModal;
