// src/components/common/ToastContainer.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
import { useTranslation } from '../../hooks/useTranslation';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration + 300);
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback((message, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 4000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration = 3500) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Localized toast messages
  const showLocalizedToast = useCallback((key, type = 'info', duration = 3000, options = {}) => {
    const message = t(key, options);
    showToast(message, type, duration);
  }, [showToast, t]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLocalizedToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          position="top-right"
        />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastContext;