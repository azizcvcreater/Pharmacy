import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function ExpensesTable({
  expenses,
  currentPage,
  perPage,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
}) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Title
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Amount
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Date
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Note
            </th>
            <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {expenses.map((expense, index) => (
            <tr key={expense.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {expense.title}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-red-600 font-semibold'>
                {formatCurrency(expense.amount)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {formatDate(expense.expense_date)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {expense.note || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                <button
                  onClick={() => onEdit(expense)}
                  className='mr-2 rounded-lg bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100'
                  aria-label='Edit expense'
                >
                  <FiEdit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDelete(expense)}
                  className='rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
                  aria-label='Delete expense'
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
