// src/components/common/Toast.jsx
import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right'
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: <FiCheckCircle className="text-green-500" size={20} />,
      text: 'text-green-800',
      progressBar: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: <FiXCircle className="text-red-500" size={20} />,
      text: 'text-red-800',
      progressBar: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: <FiAlertCircle className="text-yellow-500" size={20} />,
      text: 'text-yellow-800',
      progressBar: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: <FiInfo className="text-blue-500" size={20} />,
      text: 'text-blue-800',
      progressBar: 'bg-blue-500'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const currentType = types[type] || types.info;

  return (
    <div className={`fixed z-50 ${positionClasses[position]} animate-slideIn max-w-sm w-full`}>
      <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 ${currentType.bg} ${currentType.border} shadow-lg relative overflow-hidden`}>
        <div 
          className={`absolute bottom-0 left-0 h-1 ${currentType.progressBar} transition-all duration-50`}
          style={{ width: `${progress}%` }}
        />
        <span className="flex-shrink-0 mt-0.5">{currentType.icon}</span>
        <p className={`flex-1 text-sm font-medium ${currentType.text} break-words`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              setTimeout(onClose, 300);
            }
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          aria-label={t('common.close')}
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;