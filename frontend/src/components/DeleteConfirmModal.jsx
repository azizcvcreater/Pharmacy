import { Modal } from './Modal';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <Modal title='Confirm Delete' onClose={onClose}>
      <div className='py-4'>
        <p className='text-gray-700'>
          Are you sure you want to delete{' '}
          <span className='font-semibold'>{itemName}</span>? This action cannot
          be undone.
        </p>
      </div>
      <div className='flex justify-end space-x-3'>
        <button
          onClick={onClose}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className='rounded-lg bg-red-600 px-4 py-2 text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
