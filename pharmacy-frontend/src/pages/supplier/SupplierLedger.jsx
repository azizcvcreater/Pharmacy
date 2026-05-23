import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { Modal } from '../../components/Modal';

export default function SupplierLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const supplierId = parseInt(id, 10);

  const [supplier, setSupplier] = useState(null);
  const [balance, setBalance] = useState(0);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedger, setSelectedLedger] = useState(null);

  useEffect(() => {
    if (isNaN(supplierId)) {
      setError('Invalid supplier ID');
      setLoading(false);
      return;
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [supplierRes, balanceRes, ledgerRes] = await Promise.all([
        api.get(`/suppliers/${supplierId}`),
        api.get(`/suppliers/${supplierId}/balance`),
        api.get(`/suppliers/${supplierId}/ledger`),
      ]);

      setSupplier(supplierRes.data);
      setBalance(balanceRes.data.balance ?? 0);

      let ledgersData = ledgerRes.data;
      if (ledgersData?.data && Array.isArray(ledgersData.data)) {
        ledgersData = ledgersData.data;
      }
      setLedgers(Array.isArray(ledgersData) ? ledgersData : []);
    } catch (err) {
      console.error('Ledger fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert reference object to display string
  const getReferenceDisplay = (reference) => {
    if (!reference) return '—';
    if (reference.bill_no) return `Purchase #${reference.bill_no}`;
    if (reference.payment_date)
      return `Payment on ${new Date(reference.payment_date).toLocaleDateString()}`;
    if (typeof reference === 'string') return reference;
    return 'Reference';
  };

  const filteredLedgers = useMemo(() => {
    if (!searchTerm.trim()) return ledgers;
    const term = searchTerm.toLowerCase();
    return ledgers.filter((ledger) => {
      const amountMatch = Number(ledger.amount).toString().includes(term);
      const typeMatch = ledger.type?.toLowerCase().includes(term);
      const dateMatch = ledger.transaction_date
        ? new Date(ledger.transaction_date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(term)
        : false;
      const descriptionMatch =
        ledger.description?.toLowerCase().includes(term) ||
        ledger.note?.toLowerCase().includes(term);
      return amountMatch || typeMatch || dateMatch || descriptionMatch;
    });
  }, [ledgers, searchTerm]);

  const openModal = (ledger) => setSelectedLedger(ledger);
  const closeModal = () => setSelectedLedger(null);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className='text-center py-12'>
        <div className='text-red-600 mb-4'>{error}</div>
        <button
          onClick={() => navigate('/suppliers')}
          className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
        >
          Back to Suppliers
        </button>
      </div>
    );
  if (!supplier)
    return <div className='text-center py-12'>Supplier not found</div>;

  return (
    <div className='space-y-6 p-6'>
      <div className='flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow'>
        <button
          onClick={() => navigate('/suppliers')}
          className='text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap'
        >
          ← Back to Suppliers
        </button>
        <div className='h-6 w-px bg-gray-300' />
        <div className='flex flex-wrap items-baseline gap-2'>
          <span className='text-xl font-bold text-gray-800'>
            {supplier.name}
          </span>
          {supplier.phone && (
            <span className='text-gray-600'>📞 {supplier.phone}</span>
          )}
          {supplier.address && (
            <span className='text-gray-600'>📍 {supplier.address}</span>
          )}
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <span className='text-gray-700'>Current Balance:</span>
          <span
            className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            ${Number(balance).toFixed(2)}
          </span>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b bg-gray-50'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Ledger History
          </h3>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search by type, amount, date, or description...'
          />
        </div>

        <div className='overflow-x-auto max-h-72 overflow-y-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50 sticky top-0 z-10'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Type
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Amount
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredLedgers.map((ledger) => (
                <tr
                  key={ledger.id}
                  className='hover:bg-gray-50 cursor-pointer transition-colors'
                  onClick={() => openModal(ledger)}
                >
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-600'>
                    {ledger.transaction_date
                      ? new Date(ledger.transaction_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm capitalize'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        ledger.type === 'purchase'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ledger.type}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${
                      ledger.type === 'purchase'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {ledger.type === 'purchase' ? '+' : '-'}$
                    {Number(ledger.amount).toFixed(2)}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900'>
                    ${Number(ledger.balance).toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredLedgers.length === 0 && (
                <tr>
                  <td colSpan='4' className='text-center py-8 text-gray-500'>
                    {searchTerm
                      ? 'No matching ledger entries found.'
                      : 'No ledger entries found for this supplier.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLedger && (
        <Modal onClose={closeModal} title='Ledger Entry Details'>
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-2 border-b pb-2'>
              <span className='font-medium text-gray-600'>Date:</span>
              <span className='text-gray-800'>
                {selectedLedger.transaction_date
                  ? new Date(selectedLedger.transaction_date).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 border-b pb-2'>
              <span className='font-medium text-gray-600'>Type:</span>
              <span
                className={`capitalize font-semibold ${selectedLedger.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}
              >
                {selectedLedger.type}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 border-b pb-2'>
              <span className='font-medium text-gray-600'>Amount:</span>
              <span
                className={`font-bold ${selectedLedger.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}
              >
                {selectedLedger.type === 'purchase' ? '+' : '-'}$
                {Number(selectedLedger.amount).toFixed(2)}
              </span>
            </div>
            <div className='grid grid-cols-2 gap-2 border-b pb-2'>
              <span className='font-medium text-gray-600'>Balance After:</span>
              <span className='font-semibold text-gray-800'>
                ${Number(selectedLedger.balance).toFixed(2)}
              </span>
            </div>
            {(selectedLedger.description || selectedLedger.note) && (
              <div className='grid grid-cols-2 gap-2 border-b pb-2'>
                <span className='font-medium text-gray-600'>
                  Description/Note:
                </span>
                <span className='text-gray-800 break-words'>
                  {selectedLedger.description || selectedLedger.note}
                </span>
              </div>
            )}
            {selectedLedger.reference && (
              <div className='grid grid-cols-2 gap-2'>
                <span className='font-medium text-gray-600'>Reference:</span>
                <span className='text-gray-800'>
                  {getReferenceDisplay(selectedLedger.reference)}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
