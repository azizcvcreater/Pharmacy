import {
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiActivity,
  FiHeart,
  FiX,
} from 'react-icons/fi';

export function DoctorForm({
  formData,
  setFormData,
  extraFees,
  setExtraFees,
  onSubmit,
  submitLabel,
  onCancel,
  errors = {},
  clearErrors,
}) {
  const extraFeeOptions = [
    {
      type: 'sonography',
      label: 'Sonography',
      icon: FiActivity,
      color: 'blue',
    },
    { type: 'ecg', label: 'ECG', icon: FiHeart, color: 'red' },
    { type: 'xray', label: 'X‑ray', icon: FiX, color: 'purple' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (clearErrors) clearErrors();
  };

  const addExtraFee = (type) => {
    if (extraFees.some((fee) => fee.type === type)) return;
    setExtraFees([...extraFees, { type, amount: '' }]);
    if (clearErrors) clearErrors();
  };

  const removeExtraFee = (type) => {
    setExtraFees(extraFees.filter((fee) => fee.type !== type));
    if (clearErrors) clearErrors();
  };

  const updateExtraFeeAmount = (type, amount) => {
    setExtraFees(
      extraFees.map((fee) => (fee.type === type ? { ...fee, amount } : fee)),
    );
    if (clearErrors) clearErrors();
  };

  const getError = (field) => errors[field]?.[0];

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {/* Consultation Fee */}
      <div className='space-y-1'>
        <label className='flex items-center text-sm font-semibold text-gray-700'>
          <FiDollarSign className='h-4 w-4 mr-2 text-emerald-500' />
          Consultation Fee <span className='text-red-500 ml-1'>*</span>
        </label>
        <div className='relative'>
          <input
            type='number'
            name='fees'
            value={formData.fees}
            onChange={handleInputChange}
            required
            min='0'
            step='0.01'
            placeholder='0.00'
            className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 ${
              getError('fees') ? 'border-red-500' : 'border-gray-200'
            }`}
          />
        </div>
        {getError('fees') && (
          <p className='text-red-500 text-xs mt-1'>{getError('fees')}</p>
        )}
      </div>

      {/* Optional Test Fees Section */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-semibold text-gray-700'>
            Optional Test Fees
          </label>
          <div className='flex gap-2 flex-wrap'>
            {extraFeeOptions.map((option) => {
              const alreadyAdded = extraFees.some(
                (fee) => fee.type === option.type,
              );
              return !alreadyAdded ? (
                <button
                  key={option.type}
                  type='button'
                  onClick={() => addExtraFee(option.type)}
                  className='inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition'
                >
                  <FiPlus className='h-3 w-3' />
                  {option.label}
                </button>
              ) : null;
            })}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {extraFees.map((fee) => {
            const option = extraFeeOptions.find((opt) => opt.type === fee.type);
            const Icon = option.icon;
            const errorKey = `${fee.type}_fee`;
            return (
              <div key={fee.type} className='space-y-1'>
                <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100'>
                  <div className={`p-1.5 rounded-lg bg-${option.color}-50`}>
                    <Icon className={`h-4 w-4 text-${option.color}-500`} />
                  </div>
                  <div className='flex-1'>
                    <label className='block text-xs text-gray-500 mb-0.5'>
                      {option.label} Fee
                    </label>
                    <input
                      type='number'
                      value={fee.amount}
                      onChange={(e) =>
                        updateExtraFeeAmount(fee.type, e.target.value)
                      }
                      min='0'
                      step='0.01'
                      placeholder='0.00'
                      className={`w-full px-2 py-1 text-sm bg-white border rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-800 ${
                        getError(errorKey)
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => removeExtraFee(fee.type)}
                    className='p-1 text-red-500 hover:bg-red-50 rounded transition'
                  >
                    <FiTrash2 className='h-4 w-4' />
                  </button>
                </div>
                {getError(errorKey) && (
                  <p className='text-red-500 text-xs ml-2'>
                    {getError(errorKey)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {extraFees.length === 0 && (
          <p className='text-xs text-gray-400 text-center py-1'>
            No extra tests added. Click the buttons above to add optional fees.
          </p>
        )}
      </div>

      {/* Description */}
      <div className='space-y-1'>
        <label className='flex items-center text-sm font-semibold text-gray-700'>
          <FiFileText className='h-4 w-4 mr-2 text-gray-500' />
          Description (optional)
        </label>
        <textarea
          name='description'
          value={formData.description}
          onChange={handleInputChange}
          rows='2'
          placeholder='Add any additional notes...'
          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 resize-none ${
            getError('description') ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {getError('description') && (
          <p className='text-red-500 text-xs mt-1'>{getError('description')}</p>
        )}
      </div>

      {/* Buttons */}
      <div className='flex justify-end space-x-3 pt-3 border-t border-gray-100'>
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
