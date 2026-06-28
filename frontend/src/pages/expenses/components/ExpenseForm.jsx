import { FiFileText, FiDollarSign, FiCalendar } from 'react-icons/fi';

export function ExpenseForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  errors = {},
  clearErrors,
}) {
  const getError = (field) => errors[field]?.[0];

  const handleChange = (e) => {
    onChange(e);
    if (clearErrors) clearErrors();
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div>
        <div className='relative'>
          <FiFileText className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            name='title'
            placeholder='Title *'
            value={form.title}
            onChange={handleChange}
            className={`w-full rounded-lg border ${
              getError('title') ? 'border-red-500' : 'border-gray-200'
            } bg-gray-50 pl-10 pr-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {getError('title') && (
          <p className='text-red-500 text-xs mt-1'>{getError('title')}</p>
        )}
      </div>

      <div>
        <div className='relative'>
          <FiDollarSign className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type='number'
            name='amount'
            placeholder='Amount *'
            value={form.amount}
            onChange={handleChange}
            min='0'
            step='0.01'
            className={`w-full rounded-lg border ${
              getError('amount') ? 'border-red-500' : 'border-gray-200'
            } bg-gray-50 pl-10 pr-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {getError('amount') && (
          <p className='text-red-500 text-xs mt-1'>{getError('amount')}</p>
        )}
      </div>

      <div>
        <div className='relative'>
          <FiCalendar className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type='date'
            name='expense_date'
            value={form.expense_date}
            onChange={handleChange}
            className={`w-full rounded-lg border ${
              getError('expense_date') ? 'border-red-500' : 'border-gray-200'
            } bg-gray-50 pl-10 pr-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required
          />
        </div>
        {getError('expense_date') && (
          <p className='text-red-500 text-xs mt-1'>
            {getError('expense_date')}
          </p>
        )}
      </div>

      <div>
        <textarea
          name='note'
          placeholder='Note (optional)'
          value={form.note}
          onChange={handleChange}
          rows='3'
          className={`w-full rounded-lg border ${
            getError('note') ? 'border-red-500' : 'border-gray-200'
          } bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
        />
        {getError('note') && (
          <p className='text-red-500 text-xs mt-1'>{getError('note')}</p>
        )}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
