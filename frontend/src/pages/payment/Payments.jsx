import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../api';
import { Modal } from '../../components/Modal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { PaymentForm } from './components/PaymentForm';
import Toast from '../../components/Toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const itemsPerPage = 3;

  useEffect(() => {
    fetchSuppliers();
    fetchPayments();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load suppliers.', 'error');
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data.data || []);
    } catch (error) {
      console.error(error);
      showToast('Failed to load payments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/payments/${deleteId}`);
      showToast('Payment deleted successfully!', 'success');
      setDeleteId(null);
      fetchPayments();
    } catch (error) {
      showToast('Failed to delete payment.', 'error');
    }
  };

  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    const lower = searchTerm.toLowerCase();
    return payments.filter(
      (p) =>
        p.supplier?.name.toLowerCase().includes(lower) ||
        p.note?.toLowerCase().includes(lower) ||
        p.amount?.toString().includes(lower),
    );
  }, [payments, searchTerm]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalFilteredPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentPage < totalFilteredPages) setCurrentPage((prev) => prev + 1);
  };

  // Safely get the payment for delete modal
  const getDeleteItemName = () => {
    const payment = payments.find((p) => p.id === deleteId);
    if (!payment) return 'this payment';
    const amount =
      typeof payment.amount === 'number'
        ? payment.amount
        : parseFloat(payment.amount);
    const formattedAmount = !isNaN(amount) ? amount.toFixed(2) : '0.00';
    return `payment of $${formattedAmount} to ${payment.supplier?.name || 'unknown supplier'}`;
  };

  return (
    <div className='space-y-6 px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-semibold text-gray-800'>
          Payments to Suppliers
        </h1>
        <button
          onClick={() => {
            setEditingPayment(null);
            setShowForm(true);
          }}
          className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          New Payment
        </button>
      </div>

      <div className='flex justify-end'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search payments...'
          className='w-full sm:w-64'
        />
      </div>

      <div className='rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : paginatedPayments.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-lg text-gray-500'>No payments found.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto -mx-4 sm:mx-0'>
              <div className='inline-block min-w-full align-middle'>
                <table className='min-w-[640px] sm:min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Supplier
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Amount
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Date
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Note
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {paginatedPayments.map((payment) => (
                      <tr key={payment.id} className='hover:bg-gray-50'>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm font-medium text-gray-900'>
                          {payment.supplier?.name}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm text-gray-600'>
                          ${Number(payment.amount).toFixed(2)}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm text-gray-600'>
                          {payment.payment_date}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm text-gray-500'>
                          {payment.note || '-'}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-right text-sm'>
                          <div className='flex items-center justify-end gap-2'>
                            <button
                              onClick={() => {
                                setEditingPayment(payment);
                                setShowForm(true);
                              }}
                              className='inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100'
                            >
                              <FiEdit2 className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => setDeleteId(payment.id)}
                              className='inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
                            >
                              <FiTrash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalFilteredPages}
              onPrev={handlePrev}
              onNext={handleNext}
              className='mt-4'
            />
          </>
        )}
      </div>

      {showForm && (
        <Modal
          title={editingPayment ? 'Edit Payment' : 'New Payment'}
          onClose={() => setShowForm(false)}
        >
          <PaymentForm
            payment={editingPayment}
            suppliers={suppliers}
            onSuccess={() => {
              setShowForm(false);
              fetchPayments();
              showToast(
                editingPayment ? 'Payment updated!' : 'Payment created!',
                'success',
              );
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={getDeleteItemName()}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: '', type: 'success' })
          }
        />
      )}
    </div>
  );
}
