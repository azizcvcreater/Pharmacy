export function PurchaseDetail({ purchase }) {
  return (
    <>
      {/* Payment Summary */}
      <div className='mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Total Amount
          </span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(purchase.total_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Paid Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(purchase.paid_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>Due Amount</span>
          <p className='text-lg font-semibold text-gray-900'>
            ${Number(purchase.due_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-500'>
            Payment Status
          </span>
          <p className='text-lg font-semibold'>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                purchase.payment_status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : purchase.payment_status === 'partial'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {purchase.payment_status}
            </span>
          </p>
        </div>
      </div>

      <div className='mb-4'>
        <p className='text-sm text-gray-600'>
          <span className='font-medium'>Date:</span>{' '}
          {new Date(purchase.purchase_date).toLocaleDateString()}
        </p>
      </div>

      <div className='overflow-x-auto modern-scrollbar'>
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
                Qty
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Buy
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Total Buy
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Sale
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Unit Profit
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Total Profit
              </th>
              <th className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Expiry
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {purchase.details.map((d, idx) => (
              <tr key={idx} className='hover:bg-gray-50'>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-800'>
                  {d.generic}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {d.brand}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {d.dosage}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {d.strength}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {d.route}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {d.quantity}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  ${Number(d.buy_price).toFixed(2)}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  ${Number(d.total_buyer_price).toFixed(2)}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  ${Number(d.sale_price).toFixed(2)}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  ${Number(d.profit_per_unit).toFixed(2)}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  ${Number(d.total_profit).toFixed(2)}
                </td>
                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-600'>
                  {new Date(d.expiry_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
