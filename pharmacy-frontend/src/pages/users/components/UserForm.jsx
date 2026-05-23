import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // add eye icons

export function UserForm({
  user,
  onSubmit,
  onCancel,
  submitLabel,
  isEdit,
  errors = {},
  clearErrors,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // track visibility

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clearErrors) clearErrors();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getError = (field) => errors[field]?.[0];

  return (
    <form onSubmit={handleSubmit} autoComplete='off' className='space-y-5'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Name
        </label>
        <input
          type='text'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className={`w-full rounded-lg border ${getError('name') ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
          required
        />
        {getError('name') && (
          <p className='text-red-500 text-xs mt-1'>{getError('name')}</p>
        )}
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Email
        </label>
        <input
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          className={`w-full rounded-lg border ${getError('email') ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
          required
        />
        {getError('email') && (
          <p className='text-red-500 text-xs mt-1'>{getError('email')}</p>
        )}
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Password {isEdit && '(leave blank to keep current)'}
        </label>
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            value={formData.password}
            onChange={handleChange}
            autoComplete='new-password'
            className={`w-full rounded-lg border ${getError('password') ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2 pr-10 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
            required={!isEdit}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700'
            tabIndex={-1}
          >
            {showPassword ? (
              <FiEyeOff className='h-5 w-5' />
            ) : (
              <FiEye className='h-5 w-5' />
            )}
          </button>
        </div>
        {getError('password') && (
          <p className='text-red-500 text-xs mt-1'>{getError('password')}</p>
        )}
      </div>

      <div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700'
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
