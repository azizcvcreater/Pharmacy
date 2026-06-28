import { Modal } from './Modal';

export function LowStockModal({ items, onClose, formatDate }) {
  return (
    <Modal onClose={onClose} title='Low Stock Items'>
      {items.length === 0 ? (
        <p className='text-center text-gray-500 py-8'>No low stock items.</p>
      ) : (
        <div className='overflow-x-auto border border-gray-200 rounded-lg'>
          <div className='max-h-[20rem] overflow-y-auto relative'>
            {' '}
            <table className='w-full min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Generic
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Brand
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Quantity
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Expiry
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
                      {item.brand || '—'}
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-sm text-red-600 font-semibold'>
                      {item.quantity}
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                      {formatDate(item.expiry_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
