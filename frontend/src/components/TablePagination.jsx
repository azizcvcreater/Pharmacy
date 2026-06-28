import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function TablePagination({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className='mt-6 flex items-center justify-between border-t border-gray-100 pt-4'>
      <div className='text-sm text-gray-600'>
        Page <span className='font-medium text-indigo-600'>{currentPage}</span>{' '}
        of <span className='font-medium text-indigo-600'>{totalPages}</span>
      </div>
      <div className='flex space-x-2'>
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className='flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <FiChevronLeft className='mr-1 h-4 w-4' />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className='flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Next
          <FiChevronRight className='ml-1 h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
