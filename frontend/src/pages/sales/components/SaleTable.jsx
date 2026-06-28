import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

export function SaleTable({
  sales,
  currentPage,
  perPage,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className='overflow-x-auto modern-scrollbar'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Bill No.
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Patient
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Total
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Paid
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Due
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Status
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Date
            </th>

            <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {sales.map((sale, index) => (
            <tr key={sale.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {sale.bill_no}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {sale.patient_name || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(sale.total_amount).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(sale.paid_amount).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(sale.due_amount).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm'>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    sale.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : sale.payment_status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {sale.payment_status}
                </span>
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {new Date(sale.sale_date).toLocaleDateString()}
              </td>

              <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                <button
                  onClick={() => onView(sale.id)}
                  className='mr-2 rounded-lg bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100'
                >
                  <FiEye className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onEdit(sale.id)}
                  className='mr-2 rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100'
                >
                  <FiEdit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDelete(sale.id)}
                  className='rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
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
