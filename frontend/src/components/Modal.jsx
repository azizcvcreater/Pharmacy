import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export function Modal({ onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/0 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-3xl rounded-2xl bg-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            <FaTimes className='h-5 w-5' />
          </button>
        </div>
        <div className='px-6 py-4'>{children}</div>
      </div>
    </div>
  );
}
