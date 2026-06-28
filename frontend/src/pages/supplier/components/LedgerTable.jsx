export function LedgerTable({ ledgers }) {
  return (
    <table className='min-w-full'>
      <thead className='bg-gray-50'>
        <tr>
          <th className='px-6 py-3 text-left'>Date</th>
          <th className='px-6 py-3 text-left'>Type</th>
          <th className='px-6 py-3 text-right'>Amount</th>
          <th className='px-6 py-3 text-right'>Balance</th>
        </tr>
      </thead>
      <tbody>
        {ledgers.map((ledger) => (
          <tr key={ledger.id} className='border-t'>
            <td className='px-6 py-4'>
              {ledger.transaction_date
                ? new Date(ledger.transaction_date).toLocaleDateString()
                : 'N/A'}
            </td>
            <td className='px-6 py-4 capitalize'>{ledger.type}</td>

            <td
              className={`px-6 py-4 text-right ${ledger.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}
            >
              {ledger.type === 'purchase' ? '+' : '-'}$
              {Number(ledger.amount).toFixed(2)}
            </td>
            <td className='px-6 py-4 text-right font-semibold'>
              ${Number(ledger.balance).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
