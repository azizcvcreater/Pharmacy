import { FaExclamationTriangle } from 'react-icons/fa';

export function NearExpiryCard({ count, onClick }) {
  return (
    <div
      onClick={onClick}
      className='bg-orange-50 border border-orange-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow'
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-orange-600'>Near Expiry</p>
          <p className='text-2xl font-semibold text-orange-700'>{count}</p>
        </div>
        <div className='p-3 bg-orange-100 rounded-full'>
          <FaExclamationTriangle className='w-6 h-6 text-orange-600' />
        </div>
      </div>
    </div>
  );
}
