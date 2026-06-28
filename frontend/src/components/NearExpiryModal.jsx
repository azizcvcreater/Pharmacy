import { Modal } from '../components/Modal'; // adjust path as needed
import { FaExclamationTriangle } from 'react-icons/fa';

export function NearExpiryModal({ items, onClose, formatDate }) {
  return (
    <Modal title='Near Expiry Medicines' onClose={onClose} size='max-w-2xl'>
      {items.length === 0 ? (
        <p className='text-center text-gray-500 py-8'>
          No medicines near expiry.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Generic
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Expiry Date
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {items.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                    {item.generic}
                  </td>
                  <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                    {formatDate(item.expiry_date)}
                  </td>
                  <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                    {item.stock_quantity || item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='flex justify-end mt-4'>
        <button
          onClick={onClose}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
