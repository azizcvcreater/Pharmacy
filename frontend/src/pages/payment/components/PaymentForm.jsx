import { useState } from 'react';
import api from '../../../api';

export function PaymentForm({ payment, suppliers, onSuccess, onCancel }) {
  const [supplierId, setSupplierId] = useState(payment?.supplier_id || '');
  const [amount, setAmount] = useState(payment?.amount || '');
  const [paymentDate, setPaymentDate] = useState(
    payment?.payment_date || new Date().toISOString().split('T')[0],
  );
  const [note, setNote] = useState(payment?.note || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        supplier_id: parseInt(supplierId, 10),
        amount: parseFloat(amount),
        payment_date: paymentDate,
        note: note || null,
      };
      if (payment) {
        await api.put(`/payments/${payment.id}`, payload);
      } else {
        await api.post('/payments', payload);
      }
      onSuccess();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getError = (field) => errors[field]?.[0];

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      {/* Supplier Selection */}
      <div>
        <label
          htmlFor='supplier'
          className='block text-xs font-medium text-gray-700 mb-0.5'
        >
          Supplier <span className='text-red-500'>*</span>
        </label>
        <select
          id='supplier'
          value={supplierId}
          onChange={(e) => {
            setSupplierId(e.target.value);
            clearFieldError('supplier_id');
          }}
          className={`w-full rounded-md border ${
            getError('supplier_id') ? 'border-red-500' : 'border-gray-300'
          } px-3 py-1.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          required
          disabled={loading}
        >
          <option value=''>Select a supplier</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
        {getError('supplier_id') && (
          <p className='mt-1 text-xs text-red-600'>{getError('supplier_id')}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor='amount'
          className='block text-xs font-medium text-gray-700 mb-0.5'
        >
          Amount ($) <span className='text-red-500'>*</span>
        </label>
        <input
          id='amount'
          type='number'
          step='0.01'
          min='0.01'
          placeholder='0.00'
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            clearFieldError('amount');
          }}
          className={`w-full rounded-md border ${
            getError('amount') ? 'border-red-500' : 'border-gray-300'
          } px-3 py-1.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          required
          disabled={loading}
        />
        {getError('amount') && (
          <p className='mt-1 text-xs text-red-600'>{getError('amount')}</p>
        )}
      </div>

      {/* Payment Date */}
      <div>
        <label
          htmlFor='paymentDate'
          className='block text-xs font-medium text-gray-700 mb-0.5'
        >
          Payment Date <span className='text-red-500'>*</span>
        </label>
        <input
          id='paymentDate'
          type='date'
          value={paymentDate}
          onChange={(e) => {
            setPaymentDate(e.target.value);
            clearFieldError('payment_date');
          }}
          className={`w-full rounded-md border ${
            getError('payment_date') ? 'border-red-500' : 'border-gray-300'
          } px-3 py-1.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          required
          disabled={loading}
        />
        {getError('payment_date') && (
          <p className='mt-1 text-xs text-red-600'>
            {getError('payment_date')}
          </p>
        )}
      </div>

      {/* Note - compact */}
      <div>
        <label
          htmlFor='note'
          className='block text-xs font-medium text-gray-700 mb-0.5'
        >
          Note (Optional)
        </label>
        <textarea
          id='note'
          placeholder='Additional remarks...'
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            clearFieldError('note');
          }}
          rows={2}
          className={`w-full rounded-md border ${
            getError('note') ? 'border-red-500' : 'border-gray-300'
          } px-3 py-1.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y`}
          disabled={loading}
        />
        {getError('note') && (
          <p className='mt-1 text-xs text-red-600'>{getError('note')}</p>
        )}
      </div>

      {/* Action Buttons - compact */}
      <div className='flex gap-2 pt-1 sm:justify-end'>
        <button
          type='button'
          onClick={onCancel}
          className='inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95'
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={loading}
          className='inline-flex justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Saving...
            </>
          ) : payment ? (
            'Update'
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}
