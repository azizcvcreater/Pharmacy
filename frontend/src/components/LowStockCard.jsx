import { FaExclamationTriangle } from 'react-icons/fa';

export function LowStockCard({ count, onClick }) {
  return (
    <div
      onClick={onClick}
      className='bg-gradient-to-br from-red-50 to-red-100 shadow rounded-xl p-6 border border-red-200 cursor-pointer hover:shadow-lg hover:from-red-100 hover:to-red-200 transition-all'
    >
      <div className='flex items-center justify-between'>
        <h3 className='text-red-700 text-sm font-medium'>Low Stock</h3>
        <FaExclamationTriangle className='w-5 h-5 text-red-600' />
      </div>
      <p className='text-2xl font-bold text-red-700 mt-2'>{count}</p>
      <p className='text-xs text-red-600 mt-1'>Click to view details</p>
    </div>
  );
}
