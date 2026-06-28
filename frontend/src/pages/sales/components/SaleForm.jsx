import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useMemo } from 'react';

export function SaleForm({
  form,
  medicines,
  addRow,
  removeRow,
  onHeaderChange,
  onSelectMedicine,
  onQuantityChange,
  onSubmit,
  submitLabel,
  onCancel,
}) {
  // Calculate total amount
  const totalAmount = form.medicines.reduce((sum, row) => {
    if (row.medicine && row.quantity) {
      const price = parseFloat(row.medicine.sale_price) || 0;
      const qty = parseInt(row.quantity) || 0;
      return sum + price * qty;
    }
    return sum;
  }, 0);

  const paidAmount = parseFloat(form.paid_amount) || 0;
  const dueAmount = totalAmount - paidAmount;

  // Determine payment status
  let paymentStatus = 'pending';
  if (paidAmount >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    paymentStatus = 'partial';
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  // Map of original stock per medicine (uses original_quantity from rows if available, otherwise current stock)
  const originalStockMap = useMemo(() => {
    const map = {};
    medicines.forEach((med) => (map[med.id] = med.quantity));
    form.medicines.forEach((row) => {
      if (row.medicine?.original_quantity != null) {
        map[row.medicine_id] = row.medicine.original_quantity;
      }
    });
    return map;
  }, [medicines, form.medicines]);

  // Total allocated quantity for each medicine across all rows
  const allocatedQuantities = useMemo(() => {
    return form.medicines.reduce((acc, row) => {
      if (row.medicine_id && row.quantity) {
        acc[row.medicine_id] =
          (acc[row.medicine_id] || 0) + (parseInt(row.quantity) || 0);
      }
      return acc;
    }, {});
  }, [form.medicines]);

  // Available stock for a given row (used for remaining display and validation)
  const getAvailableStock = (row, currentIndex) => {
    if (!row.medicine_id) return 0;
    const originalStock = originalStockMap[row.medicine_id] || 0;
    const allocated = form.medicines.reduce((total, r, idx) => {
      if (idx !== currentIndex && r.medicine_id == row.medicine_id) {
        return total + (parseInt(r.quantity) || 0);
      }
      return total;
    }, 0);
    return originalStock - allocated;
  };

  // Row validation
  const getRowErrors = (row, index) => {
    const errors = {};
    if (!row.medicine_id) {
      errors.medicine = 'Please select a medicine';
    }
    if (!row.quantity || row.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than zero';
    } else {
      const available = getAvailableStock(row, index);
      if (parseInt(row.quantity) > available) {
        errors.quantity = `Exceeds stock (${available})`;
      }
    }
    return errors;
  };

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Header inputs */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <input
          type='text'
          name='bill_no'
          placeholder='Bill Number'
          value={form.bill_no}
          onChange={onHeaderChange}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        />
        <input
          type='text'
          name='patient_name'
          placeholder='Patient Name'
          value={form.patient_name}
          onChange={onHeaderChange}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        />
        <input
          type='date'
          name='sale_date'
          value={form.sale_date}
          onChange={onHeaderChange}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        />
        <input
          type='number'
          name='paid_amount'
          placeholder='Paid Amount'
          value={form.paid_amount}
          onChange={onHeaderChange}
          min='0'
          step='0.01'
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
        />
      </div>

      {/* Payment Summary */}
      <div className='mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Total Amount
          </span>
          <p className='text-lg font-semibold text-gray-900'>
            ${totalAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Paid Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${paidAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Due Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${dueAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Payment Status
          </span>
          <p className='text-lg font-semibold'>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                paymentStatus,
              )}`}
            >
              {paymentStatus}
            </span>
          </p>
        </div>
      </div>

      {/* Medicines table */}
      <div className='overflow-x-auto border border-gray-200 rounded-lg'>
        <div className='h-[7rem]  overflow-x-auto modern-scrollbar'>
          <table className='w-full min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Generic
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Brand
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Dosage
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Strength
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Route
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Quantity
                </th>
                <th className='px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {form.medicines.map((row, index) => {
                const errors = getRowErrors(row, index);
                const available = getAvailableStock(row, index);
                const remaining = available - (parseInt(row.quantity) || 0);
                const isLastRow = form.medicines.length === 1;

                // Filter medicines for this row's dropdown
                const availableMedicines = medicines.filter((med) => {
                  // Always keep the currently selected medicine
                  if (med.id === row.medicine_id) return true;
                  const original = originalStockMap[med.id] || med.quantity;
                  const allocated = allocatedQuantities[med.id] || 0;
                  return original - allocated > 0;
                });

                return (
                  <tr key={index} className='hover:bg-gray-50'>
                    {/* Name dropdown */}
                    <td className='px-3 py-2'>
                      <select
                        value={row.medicine_id}
                        onChange={(e) =>
                          onSelectMedicine(index, e.target.value)
                        }
                        className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      >
                        <option value=''>Select</option>
                        {availableMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.generic}
                          </option>
                        ))}
                      </select>
                      {errors.medicine && (
                        <p className='text-xs text-red-600 mt-1'>
                          {errors.medicine}
                        </p>
                      )}
                    </td>
                    {/* Generic dropdown */}
                    <td className='px-3 py-2'>
                      <select
                        value={row.medicine_id}
                        onChange={(e) =>
                          onSelectMedicine(index, e.target.value)
                        }
                        className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      >
                        <option value=''>Select</option>
                        {availableMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.brand}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Company dropdown */}
                    <td className='px-3 py-2'>
                      <select
                        value={row.medicine_id}
                        onChange={(e) =>
                          onSelectMedicine(index, e.target.value)
                        }
                        className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      >
                        <option value=''>Select</option>
                        {availableMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.dosage}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Family dropdown */}
                    <td className='px-3 py-2'>
                      <select
                        value={row.medicine_id}
                        onChange={(e) =>
                          onSelectMedicine(index, e.target.value)
                        }
                        className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      >
                        <option value=''>Select</option>
                        {availableMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.strength}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={row.medicine_id}
                        onChange={(e) =>
                          onSelectMedicine(index, e.target.value)
                        }
                        className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      >
                        <option value=''>Select</option>
                        {availableMedicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.route}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quantity with remaining indicator */}
                    <td className='px-3 py-2'>
                      <div>
                        <input
                          type='number'
                          min='1'
                          value={row.quantity}
                          onChange={(e) =>
                            onQuantityChange(index, e.target.value)
                          }
                          className='w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                        />
                        {row.medicine_id && (
                          <p className='text-xs text-gray-500 mt-1'>
                            Remaining: {remaining >= 0 ? remaining : 0}
                          </p>
                        )}
                        {errors.quantity && (
                          <p className='text-xs text-red-600 mt-1'>
                            {errors.quantity}
                          </p>
                        )}
                      </div>
                    </td>
                    {/* Remove button */}
                    <td className='px-3 py-2 text-right'>
                      <button
                        type='button'
                        onClick={() => removeRow(index)}
                        disabled={isLastRow}
                        className={`text-red-600 hover:text-red-800 ${
                          isLastRow ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FiTrash2 className='h-4 w-4' />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type='button'
        onClick={addRow}
        className='flex items-center text-sm text-indigo-600 hover:text-indigo-800'
      >
        <FiPlus className='mr-1 h-4 w-4' />
        Add Medicine
      </button>

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
          className='rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
