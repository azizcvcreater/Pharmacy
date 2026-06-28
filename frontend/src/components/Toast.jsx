import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  // Auto-hide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed left-1/2 top-8 z-[999] min-w-[300px] max-w-[80%] -translate-x-1/2 rounded-lg px-6 py-4 text-center font-medium text-white shadow-lg transition-opacity duration-300 ${
        type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
      }`}
    >
      {message}
      {/* Progress bar */}
      <div
        className='absolute bottom-0 left-0 h-1 rounded-b-lg bg-white bg-opacity-50 transition-all duration-3000'
        style={{ width: '100%' }}
      ></div>
      {/* Close button */}
      <button
        onClick={onClose}
        className='absolute right-3 top-2 bg-transparent text-2xl font-bold text-white opacity-70 hover:opacity-100'
      >
        &times;
      </button>
    </div>
  );
}
