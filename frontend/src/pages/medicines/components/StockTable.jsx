export function StockTable({ medicines, currentPage, perPage }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—';
    return `$${Number(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getStockBadge = (quantity) => {
    if (quantity < 100) {
      return (
        <span className='inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'>
          {quantity} low
        </span>
      );
    }
    return <span className='text-sm text-gray-800'>{quantity}</span>;
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'generic', label: 'Generic' },
    { key: 'brand', label: 'Brand' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'strength', label: 'Strength' },
    { key: 'route', label: 'Route' },
    { key: 'buy_price', label: 'Buy Price' },
    { key: 'sale_price', label: 'Sale Price' },
    { key: 'quantity', label: 'Stock' },
    { key: 'expiry_date', label: 'Expiry Date' },
  ];

  return (
    <div className='overflow-x-auto modern-scrollbar'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {medicines.map((med, index) => (
            <tr key={med.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-800'>
                {med.supplier?.name || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-800'>
                {med.generic}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {med.brand || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {med.dosage || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {med.strength || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {med.route || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-800'>
                {formatCurrency(med.buy_price)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-800'>
                {formatCurrency(med.sale_price)}
              </td>
              <td className='whitespace-nowrap px-4 py-3'>
                {getStockBadge(med.quantity)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {formatDate(med.expiry_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
