// src/components/common/LoadingSpinner.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!showText) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [showText]);

  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
    xl: 'w-20 h-20 border-4',
  };

  const sizeConfig = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeConfig} rounded-full border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent animate-spin`}></div>
      
      {showText && text && (
        <p className="mt-3 text-sm text-gray-600">
          {text || t('common.loading')}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;