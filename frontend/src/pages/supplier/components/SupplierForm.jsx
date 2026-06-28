import { useState } from 'react';
import api from '../../../api';

export function SupplierForm({ supplier, onSuccess, onCancel }) {
  const [name, setName] = useState(supplier?.name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [address, setAddress] = useState(supplier?.address || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (supplier) {
        await api.put(`/suppliers/${supplier.id}`, { name, phone, address });
      } else {
        await api.post('/suppliers', { name, phone, address });
      }
      onSuccess();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error(error);
        // Optional: show a toast notification for non‑validation errors
      }
    } finally {
      setLoading(false);
    }
  };

  const getError = (field) => errors[field]?.[0];

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Name Field */}
      <div>
        <label
          htmlFor='supplier-name'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Name <span className='text-red-500'>*</span>
        </label>
        <input
          id='supplier-name'
          type='text'
          placeholder='Enter supplier name'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          className={`w-full rounded-lg border ${
            getError('name') ? 'border-red-500' : 'border-gray-300'
          } px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          required
          disabled={loading}
        />
        {getError('name') && (
          <p className='mt-1 text-sm text-red-600'>{getError('name')}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label
          htmlFor='supplier-phone'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Phone
        </label>
        <input
          id='supplier-phone'
          type='tel'
          placeholder='Enter phone number'
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
          className={`w-full rounded-lg border ${
            getError('phone') ? 'border-red-500' : 'border-gray-300'
          } px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          disabled={loading}
        />
        {getError('phone') && (
          <p className='mt-1 text-sm text-red-600'>{getError('phone')}</p>
        )}
      </div>

      {/* Address Field */}
      <div>
        <label
          htmlFor='supplier-address'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Address
        </label>
        <textarea
          id='supplier-address'
          placeholder='Enter address'
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (errors.address) setErrors({ ...errors, address: undefined });
          }}
          rows={3}
          className={`w-full rounded-lg border ${
            getError('address') ? 'border-red-500' : 'border-gray-300'
          } px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y`}
          disabled={loading}
        />
        {getError('address') && (
          <p className='mt-1 text-sm text-red-600'>{getError('address')}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={onCancel}
          className='inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95'
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={loading}
          className='inline-flex justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
          ) : (
            'Save Supplier'
          )}
        </button>
      </div>
    </form>
  );
}
