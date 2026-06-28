// src/pages/ItemsPage/components/ItemsTable.jsx
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function ItemsTable({ items, currentPage, perPage, onEdit, onDelete }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Generic
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Brand
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Dosage
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Strength
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Route
            </th>

            <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {items.map((item, index) => (
            <tr key={item.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {item.generic}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {item.brand || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {item.dosage || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {item.strength || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {item.route || '—'}
              </td>
              
                <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                  <button
                    onClick={() => onEdit(item)}
                    className='mr-2 rounded-lg bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100'
                    aria-label='Edit item'
                  >
                    <FiEdit2 className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className='rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
                    aria-label='Delete item'
                  >
                    <FiTrash2 className='h-4 w-4' />
                  </button>
                </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
