// src/pages/Payments.jsx
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiDollarSign, FiCalendar, FiUser, FiPlus, FiRefreshCw } from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import PaymentForm from '../components/suppliers/PaymentForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Payments = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    supplier_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchSuppliers();
  }, [currentPage, searchTerm, filterSupplier]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers?limit=100');
      const data = response.data.data || response.data || [];
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      
      if (filterSupplier) {
        params.append('supplier_id', filterSupplier);
      }
      
      const response = await api.get(`/supplier-payments?${params.toString()}`);
      
      let data = [];
      let total = 0;
      
      if (response.data && response.data.data) {
        data = response.data.data;
        total = response.data.total || 0;
        setTotalPages(response.data.last_page || 1);
      } else if (Array.isArray(response.data)) {
        data = response.data;
        total = response.data.length;
        setTotalPages(1);
      } else {
        data = [];
        total = 0;
        setTotalPages(1);
      }
      
      setPayments(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
      showToast(t('errors.generic'), 'error');
      setPayments([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/supplier-payments/${editingId}`, formData);
        showToast(t('success.updated'), 'success');
      } else {
        await api.post('/supplier-payments', formData);
        showToast(t('success.created'), 'success');
      }

      await fetchPayments();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      supplier_id: payment.supplier_id,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
    });
    setEditingId(payment.id);
    setShowAddModal(true);
  };

  const handleDeleteClick = (payment) => {
    setDeleteTarget(payment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/supplier-payments/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchPayments();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || t('errors.generic'), 'error');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaymentMethodBadge = (method) => {
    const methodLabels = {
      cash: t('payments.methods.cash'),
      bank_transfer: t('payments.methods.bankTransfer'),
      check: t('payments.methods.check'),
      credit_card: t('payments.methods.creditCard'),
      online: t('payments.methods.online'),
    };
    const colors = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      check: 'bg-purple-100 text-purple-800',
      credit_card: 'bg-orange-100 text-orange-800',
      online: 'bg-indigo-100 text-indigo-800',
    };
    return {
      color: colors[method] || 'bg-gray-100 text-gray-800',
      label: methodLabels[method] || method,
    };
  };

  const columns = [
    {
      header: '#',
      render: (_, index) => (
        <span className="text-gray-500">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
      width: '50px'
    },
    {
      header: t('payments.table.supplier'),
      key: 'supplier',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {item.supplier?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <span className="font-medium text-gray-900">{item.supplier?.name || 'Unknown'}</span>
        </div>
      )
    },
    {
      header: t('payments.table.amount'),
      key: 'amount',
      render: (item) => (
        <span className="font-semibold text-green-600">
          ${parseFloat(item.amount).toFixed(2)}
        </span>
      )
    },
    {
      header: t('payments.table.method'),
      key: 'payment_method',
      render: (item) => {
        const { color, label } = getPaymentMethodBadge(item.payment_method);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      header: t('payments.table.date'),
      key: 'payment_date',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {new Date(item.payment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },
    {
      header: t('payments.table.reference'),
      key: 'reference_number',
      render: (item) => (
        <span className="text-sm text-gray-500">
          {item.reference_number || '—'}
        </span>
      )
    },
    {
      header: t('payments.table.actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={t('common.edit')}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={t('common.delete')}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
      width: '100px'
    }
  ];

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">{error}</p>
          <Button onClick={fetchPayments}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('payments.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('payments.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchPayments}
            variant="secondary"
            icon={<FiRefreshCw size={18} />}
          >
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            icon={<FiPlus size={18} />}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            {t('payments.record')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('payments.statistics.totalPayments')}</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('payments.statistics.totalAmount')}</p>
              <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('payments.statistics.suppliers')}</p>
              <p className="text-2xl font-bold text-gray-800">{suppliers.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <FiUser size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t('payments.searchPlaceholder')}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="sm:w-64">
            <Select
              name="filterSupplier"
              value={filterSupplier}
              onChange={(e) => {
                setFilterSupplier(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: t('common.all') },
                ...suppliers.map(s => ({ value: s.id, label: s.name }))
              ]}
              className="!mb-0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={payments}
          emptyMessage={
            searchTerm || filterSupplier
              ? t('common.noResults')
              : t('payments.noResults')
          }
        />
        
        {payments.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
        title={editingId ? t('payments.edit') : t('payments.record')}
        size="md"
      >
        <PaymentForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowAddModal(false);
          }}
          suppliers={suppliers}
          isEditing={!!editingId}
          loading={submitting}
        />
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('payments.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('payments.deleteConfirm', { 
                amount: `$${parseFloat(deleteTarget?.amount || 0).toFixed(2)}`,
                supplier: deleteTarget?.supplier?.name || ''
              })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('payments.deleteWarning')}
            </p>
          </div>
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Payments;