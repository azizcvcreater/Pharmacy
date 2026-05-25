// src/pages/Purchases/components/PurchaseTable.jsx
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

export function PurchaseTable({
  purchases,
  currentPage,
  perPage,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className='w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm'>
      <table className='min-w-[800px] w-full divide-y divide-gray-200 md:min-w-full'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Bill No.
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Total Cost
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Total Profit
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Total Amount
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
          {purchases.map((p, index) => (
            <tr key={p.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {p.bill_no}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(p.details_sum_total_buyer_price ?? 0).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(p.details_sum_total_profit ?? 0).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(p.total_amount ?? 0).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(p.paid_amount ?? 0).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                ${Number(p.due_amount ?? 0).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm'>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    p.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : p.payment_status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {p.payment_status}
                </span>
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {new Date(p.purchase_date).toLocaleDateString()}
              </td>

              <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                <button
                  onClick={() => onView(p.id)}
                  className='mr-2 inline-flex items-center justify-center rounded-lg bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95'
                  aria-label='View purchase'
                >
                  <FiEye className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onEdit(p.id)}
                  className='mr-2 inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95'
                  aria-label='Edit purchase'
                >
                  <FiEdit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className='inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-95'
                  aria-label='Delete purchase'
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
