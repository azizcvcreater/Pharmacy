import { FiPlus, FiTrash2 } from 'react-icons/fi';

export function PurchaseForm({
  form,
  setForm,
  generic = [],
  brand = [],
  dosage = [],
  strength = [],
  route = [],
  addRow,
  removeRow,
  changeMedicine,
  onSubmit,
  submitLabel,
  onCancel,
  suppliers = [],
  supplierBalance = null,
  fetchSupplierBalance,
}) {
  const medicines = form?.medicines || [];

  const totalAmount = medicines.reduce(
    (sum, med) => sum + Number(med.quantity || 0) * Number(med.buy_price || 0),
    0,
  );

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Supplier Selection & Balance */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <select
          value={form.supplier_id || ''}
          onChange={(e) => {
            const supId = e.target.value;
            setForm({ ...form, supplier_id: supId });
            if (supId && fetchSupplierBalance) {
              fetchSupplierBalance(supId);
            } else {
              // clear balance if no supplier
              if (fetchSupplierBalance) fetchSupplierBalance(null);
            }
          }}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        >
          <option value=''>Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {supplierBalance !== null && (
          <div className='col-span-2 text-sm p-2 rounded bg-gray-100 flex items-center'>
            <span className='font-medium text-gray-700 mr-2'>
              Current Balance:
            </span>
            <span
              className={`font-bold ${
                supplierBalance > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              ${Number(supplierBalance).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Bill, Date and Paid Amount */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <input
          type='text'
          placeholder='Bill Number'
          value={form.bill_no}
          onChange={(e) => setForm({ ...form, bill_no: e.target.value })}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        />
        <input
          type='date'
          value={form.purchase_date}
          onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
          required
        />
        <input
          type='number'
          min='0'
          step='0.01'
          placeholder='Paid Amount'
          value={form.paid_amount}
          onChange={(e) =>
            setForm({ ...form, paid_amount: parseFloat(e.target.value) || 0 })
          }
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
        />
      </div>

      {/* Optional: Show calculated totals */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded-lg'>
        <div>
          <span className='font-medium text-gray-700'>Total Amount: </span>
          <span className='text-gray-900'>${totalAmount.toFixed(2)}</span>
        </div>
        <div>
          <span className='font-medium text-gray-700'>Paid: </span>
          <span className='text-gray-900'>
            ${Number(form.paid_amount).toFixed(2)}
          </span>
        </div>
        <div>
          <span className='font-medium text-gray-700'>Due: </span>
          <span className='text-gray-900'>
            ${(totalAmount - (form.paid_amount || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Medicines table (unchanged) */}
      <div className='overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100'>
        <div className='h-[7rem] overflow-x-auto modern-scrollbar'>
          <table className='w-full min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50 sticky top-0 z-10'>
              <tr>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Qty
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Generic
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Brand
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Form
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Strength
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Route
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Buy Price
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Sale Price
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Expiry
                </th>
                <th className='px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {(form.medicines || []).map((med, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td>
                    <input
                      type='number'
                      min='1'
                      value={med.quantity || ''}
                      onChange={(e) =>
                        changeMedicine(index, 'quantity', e.target.value)
                      }
                      className='w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-indigo-400 text-black focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      required
                    />
                  </td>
                  <td>
                    <select
                      value={med.generic}
                      onChange={(e) =>
                        changeMedicine(index, 'generic', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 text-black px-2 py-1 text-sm'
                      required
                    >
                      <option value=''>Select</option>
                      {generic.map((g, i) => (
                        <option key={i} value={g.generic}>
                          {g.generic}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={med.brand}
                      onChange={(e) =>
                        changeMedicine(index, 'brand', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 text-black px-2 py-1 text-sm'
                      required
                    >
                      <option value=''>Select</option>
                      {brand.map((b, i) => (
                        <option key={i} value={b.brand}>
                          {b.brand}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={med.dosage}
                      onChange={(e) =>
                        changeMedicine(index, 'dosage', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 text-black px-2 py-1 text-sm'
                      required
                    >
                      <option value=''>Select</option>
                      {dosage.map((d, i) => (
                        <option key={i} value={d.dosage}>
                          {d.dosage}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={med.strength}
                      onChange={(e) =>
                        changeMedicine(index, 'strength', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 text-black px-2 py-1 text-sm'
                      required
                    >
                      <option value=''>Select</option>
                      {strength.map((s, i) => (
                        <option key={i} value={s.strength}>
                          {s.strength}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={med.route}
                      onChange={(e) =>
                        changeMedicine(index, 'route', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 text-black px-2 py-1 text-sm'
                      required
                    >
                      <option value=''>Select</option>
                      {route.map((r, i) => (
                        <option key={i} value={r.route}>
                          {r.route}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='px-3 py-2'>
                    <input
                      type='number'
                      step='0.01'
                      value={med.buy_price}
                      placeholder='90...'
                      onChange={(e) =>
                        changeMedicine(index, 'buy_price', e.target.value)
                      }
                      className='w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-indigo-400 text-black focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      required
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <input
                      type='number'
                      step='0.01'
                      value={med.sale_price}
                      placeholder='90...'
                      onChange={(e) =>
                        changeMedicine(index, 'sale_price', e.target.value)
                      }
                      className='w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-indigo-400 text-black focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      required
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <input
                      type='date'
                      value={med.expiry_date}
                      onChange={(e) =>
                        changeMedicine(index, 'expiry_date', e.target.value)
                      }
                      className='w-32 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:border-indigo-400 text-black focus:outline-none focus:ring-1 focus:ring-indigo-200'
                      required
                    />
                  </td>
                  <td className='px-3 py-2 text-right'>
                    <button
                      type='button'
                      onClick={() => removeRow(index)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <FiTrash2 className='h-4 w-4' />
                    </button>
                  </td>
                </tr>
              ))}
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
