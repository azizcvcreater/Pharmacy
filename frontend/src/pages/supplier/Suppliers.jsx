import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Modal } from '../../components/Modal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { SupplierForm } from './components/SupplierForm';
import Toast from '../../components/Toast';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  // Toast state
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
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
      setTotalPages(Math.ceil(res.data.length / itemsPerPage));
      // fetch balances for each supplier
      const balObj = {};
      for (const sup of res.data) {
        const balRes = await api.get(`/suppliers/${sup.id}/balance`);
        balObj[sup.id] = balRes.data.balance;
      }
      setBalances(balObj);
    } catch (error) {
      console.error(error);
      showToast('Failed to load suppliers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${deleteId}`);
      showToast('Supplier deleted successfully!', 'success');
      setDeleteId(null);
      fetchSuppliers();
    } catch (error) {
      showToast('Failed to delete supplier.', 'error');
    }
  };

  // Filter suppliers by search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    const lower = searchTerm.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.phone?.toLowerCase().includes(lower) ||
        s.address?.toLowerCase().includes(lower),
    );
  }, [suppliers, searchTerm]);

  // Pagination
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(start, start + itemsPerPage);
  }, [filteredSuppliers, currentPage]);

  const totalFilteredPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalFilteredPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className='space-y-6 px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-semibold text-gray-800'>Suppliers</h1>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className='flex justify-end'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search suppliers...'
          className='w-full sm:w-64'
        />
      </div>

      {/* Table Container */}
      <div className='rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : paginatedSuppliers.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-lg text-gray-500'>No suppliers found.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto -mx-4 sm:mx-0'>
              <div className='inline-block min-w-full align-middle'>
                <table className='min-w-[640px] sm:min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Name
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Phone
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Address
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Balance
                      </th>
                      <th className='px-4 py-3 sm:px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {paginatedSuppliers.map((sup) => (
                      <tr key={sup.id} className='hover:bg-gray-50'>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm font-medium text-gray-900'>
                          {sup.name}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm text-gray-600'>
                          {sup.phone || '-'}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm text-gray-600'>
                          {sup.address || '-'}
                        </td>
                        <td
                          className='whitespace-nowrap px-4 py-4 sm:px-6 text-sm font-semibold'
                          style={{
                            color: balances[sup.id] > 0 ? '#dc2626' : '#10b981',
                          }}
                        >
                          ${Number(balances[sup.id] || 0).toFixed(2)}
                        </td>
                        <td className='whitespace-nowrap px-4 py-4 sm:px-6 text-right text-sm'>
                          <div className='flex items-center justify-end gap-2'>
                            <button
                              onClick={() =>
                                navigate(`/suppliers/${sup.id}/ledger`)
                              }
                              className='inline-flex items-center justify-center rounded-lg bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95'
                              aria-label='View ledger'
                            >
                              <FiEye className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSupplier(sup);
                                setShowForm(true);
                              }}
                              className='inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95'
                              aria-label='Edit supplier'
                            >
                              <FiEdit2 className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => setDeleteId(sup.id)}
                              className='inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-95'
                              aria-label='Delete supplier'
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

      {/* Supplier Form Modal */}
      {showForm && (
        <Modal
          title={editingSupplier ? 'Edit Supplier' : 'New Supplier'}
          onClose={() => setShowForm(false)}
        >
          <SupplierForm
            supplier={editingSupplier}
            onSuccess={() => {
              setShowForm(false);
              fetchSuppliers();
              showToast(
                editingSupplier
                  ? 'Supplier updated successfully!'
                  : 'Supplier created successfully!',
                'success',
              );
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={`supplier "${suppliers.find((s) => s.id === deleteId)?.name}"`}
      />

      {/* Toast Notifications */}
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
