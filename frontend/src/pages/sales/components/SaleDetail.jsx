export function SaleDetail({ sale }) {
  return (
    <>
      {/* Payment Summary */}
      <div className='mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Total Amount
          </span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(sale.total_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Paid Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(sale.paid_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Due Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(sale.due_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Payment Status
          </span>
          <p className='text-lg font-semibold'>
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
          </p>
        </div>
      </div>

      {/* Sale Info */}
      <div className='mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div>
          <span className='text-xs font-medium text-gray-500 block'>
            Bill No.
          </span>
          <span className='text-sm font-semibold text-gray-900'>
            {sale.bill_no}
          </span>
        </div>
        <div>
          <span className='text-xs font-medium text-gray-500 block'>
            Patient
          </span>
          <span className='text-sm font-semibold text-gray-900'>
            {sale.patient_name}
          </span>
        </div>
        <div>
          <span className='text-xs font-medium text-gray-500 block'>Date</span>
          <span className='text-sm font-semibold text-gray-900'>
            {new Date(sale.sale_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Medicines Table */}
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
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {sale.details.map((detail, idx) => (
              <tr key={idx} className='hover:bg-gray-50'>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-800'>
                  {detail.medicine.generic}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {detail.medicine.brand}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {detail.medicine.dosage}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {detail.medicine.strength}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {detail.medicine.route}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {detail.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
