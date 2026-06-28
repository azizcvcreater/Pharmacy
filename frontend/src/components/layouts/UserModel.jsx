import { FiLogOut } from 'react-icons/fi';
import { useClickOutside } from '../../hooks/useClickOutside';

export function UserModal({ isOpen, onClose, user, onLogout, buttonRef }) {
  const modalRef = useClickOutside(
    [{ current: modalRef?.current }, buttonRef],
    onClose,
    isOpen,
  );

  if (!isOpen || !user) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-50' onClick={onClose} />
      <div
        ref={modalRef}
        className='fixed z-50 bg-white rounded-xl shadow-xl w-72 p-5 animate-fade-in'
        style={{ top: '4rem', right: '1rem' }}
      >
        <div className='flex flex-col items-center space-y-3'>
          <div className='h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold'>
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-gray-900'>{user.name}</p>
            <p className='text-xs text-gray-500'>{user.email}</p>
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors'
          >
            <FiLogOut className='h-4 w-4' />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
