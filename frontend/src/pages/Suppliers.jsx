// src/pages/Suppliers.jsx
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPhone, FiMapPin, FiPlus, FiDollarSign, FiCalendar, FiEye } from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import SupplierForm from '../components/suppliers/SupplierForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Suppliers = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [paymentFormData, setPaymentFormData] = useState({
    supplier_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/suppliers?${params.toString()}`);
      
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
      
      const suppliersWithPayments = await Promise.all(
        data.map(async (supplier) => {
          try {
            const summaryRes = await api.get(`/supplier-payments/summary/${supplier.id}`);
            return {
              ...supplier,
              total_paid: summaryRes.data.total_paid || 0,
              total_purchases: summaryRes.data.total_purchases || 0,
              balance: summaryRes.data.balance || 0,
              balance_formatted: summaryRes.data.balance_formatted || '$0.00 (Balanced)',
              status: summaryRes.data.status || 'zero',
              status_label: summaryRes.data.status_label || 'Balanced',
              status_color: summaryRes.data.status_color || 'text-gray-600',
              description: summaryRes.data.description || 'All settled',
              payment_count: summaryRes.data.payment_count || 0,
              purchase_count: summaryRes.data.purchase_count || 0,
              last_payment: summaryRes.data.last_payment,
            };
          } catch (error) {
            return {
              ...supplier,
              total_paid: 0,
              total_purchases: 0,
              balance: 0,
              balance_formatted: '$0.00 (Balanced)',
              status: 'zero',
              status_label: 'Balanced',
              status_color: 'text-gray-600',
              description: 'All settled',
              payment_count: 0,
              purchase_count: 0,
              last_payment: null,
            };
          }
        })
      );
      
      setSuppliers(suppliersWithPayments);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
      showToast(t('errors.generic'), 'error');
      setSuppliers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (supplierId) => {
    try {
      setLoadingPayments(true);
      const response = await api.get(`/supplier-payments?supplier_id=${supplierId}&limit=50`);
      
      let data = [];
      if (response.data && response.data.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleViewPayments = async (supplier) => {
    setSelectedSupplier(supplier);
    setPaymentFormData(prev => ({
      ...prev,
      supplier_id: supplier.id
    }));
    await fetchPaymentHistory(supplier.id);
    setShowPaymentModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({ ...paymentFormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData);
        showToast(t('success.updated'), 'success');
      } else {
        await api.post('/suppliers', formData);
        showToast(t('success.created'), 'success');
      }

      await fetchSuppliers();
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

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentFormData.supplier_id) {
      showToast('Supplier ID is missing. Please try again.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const paymentData = {
        supplier_id: parseInt(paymentFormData.supplier_id),
        amount: parseFloat(paymentFormData.amount),
        payment_date: paymentFormData.payment_date,
        payment_method: paymentFormData.payment_method,
        reference_number: paymentFormData.reference_number || null,
        notes: paymentFormData.notes || null,
      };

      await api.post('/supplier-payments', paymentData);
      showToast(t('success.created'), 'success');
      
      await fetchSuppliers();
      
      if (selectedSupplier) {
        await fetchPaymentHistory(selectedSupplier.id);
      }
      
      setPaymentFormData({
        supplier_id: selectedSupplier?.id || '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
      });
    } catch (err) {
      console.error('Payment error:', err.response?.data);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setEditingId(supplier.id);
    setShowAddModal(true);
  };

  const handleDeleteClick = (supplier) => {
    setDeleteTarget(supplier);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/suppliers/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchSuppliers();
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
      name: '',
      phone: '',
      address: ''
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
      header: t('suppliers.table.supplier'),
      key: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {item.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <span className="font-medium text-gray-900">{item.name}</span>
            {item.phone && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <FiPhone size={12} />
                {item.phone}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('suppliers.table.totalPurchases'),
      key: 'total_purchases',
      render: (item) => (
        <div>
          <span className="font-medium text-blue-600">
            ${(item.total_purchases || 0).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 block">
            {item.purchase_count || 0} {t('dashboard.purchases')}
          </span>
        </div>
      )
    },
    {
      header: t('suppliers.table.totalPaid'),
      key: 'total_paid',
      render: (item) => (
        <div>
          <span className="font-medium text-green-600">
            ${(item.total_paid || 0).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 block">
            {item.payment_count || 0} {t('dashboard.payments')}
          </span>
        </div>
      )
    },
    {
      header: t('suppliers.table.balance'),
      key: 'balance',
      render: (item) => {
        const balance = item.balance || 0;
        
        if (balance > 0) {
          return (
            <div>
              <span className="font-bold text-red-600">
                ${balance.toFixed(2)}
              </span>
              <span className="text-xs text-red-500 block">{t('suppliers.statistics.credit')}</span>
            </div>
          );
        } else if (balance < 0) {
          return (
            <div>
              <span className="font-bold text-green-600">
                ${Math.abs(balance).toFixed(2)}
              </span>
              <span className="text-xs text-green-500 block">{t('suppliers.statistics.debit')}</span>
            </div>
          );
        }
        return (
          <div>
            <span className="font-bold text-gray-600">$0.00</span>
            <span className="text-xs text-gray-400 block">{t('suppliers.statistics.balanced')}</span>
          </div>
        );
      }
    },
    {
      header: t('suppliers.table.lastPayment'),
      key: 'last_payment',
      render: (item) => {
        if (item.last_payment) {
          return (
            <div>
              <span className="text-sm text-gray-600">
                ${parseFloat(item.last_payment.amount).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 block">
                {new Date(item.last_payment.payment_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">{t('common.noData')}</span>;
      }
    },
    {
      header: t('suppliers.table.address'),
      key: 'address',
      render: (item) => (
        <div className="flex items-center gap-2">
          <FiMapPin className="text-gray-400 flex-shrink-0" size={14} />
          <span className="text-gray-700 line-clamp-2">
            {item.address || <span className="text-gray-400">—</span>}
          </span>
        </div>
      )
    },
    {
      header: t('suppliers.table.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewPayments(item)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label={t('common.view')}
            title={t('common.view')}
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={t('common.edit')}
            title={t('common.edit')}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={t('common.delete')}
            title={t('common.delete')}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
      width: '140px'
    }
  ];

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
          <Button onClick={fetchSuppliers}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  const totalReceived = suppliers.reduce((sum, s) => sum + (s.total_paid || 0), 0);
  const totalPurchases = suppliers.reduce((sum, s) => sum + (s.total_purchases || 0), 0);
  const totalBalance = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('suppliers.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('suppliers.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          icon={<FiPlus size={18} />}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {t('suppliers.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('suppliers.statistics.totalSuppliers')}</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiMapPin size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('suppliers.statistics.totalPurchases')}</p>
              <p className="text-2xl font-bold text-blue-600">${totalPurchases.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('suppliers.statistics.totalPaid')}</p>
              <p className="text-2xl font-bold text-green-600">${totalReceived.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('suppliers.statistics.totalBalance')}</p>
              <p className={`text-2xl font-bold ${totalBalance > 0 ? 'text-red-600' : totalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                ${Math.abs(totalBalance).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                {totalBalance > 0 ? t('suppliers.statistics.credit') : totalBalance < 0 ? t('suppliers.statistics.debit') : t('suppliers.statistics.balanced')}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              totalBalance > 0 ? 'bg-red-100 text-red-600' : 
              totalBalance < 0 ? 'bg-green-100 text-green-600' : 
              'bg-gray-100 text-gray-600'
            }`}>
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder={t('suppliers.searchPlaceholder')}
          onClear={() => {
            setSearchTerm('');
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={suppliers}
          emptyMessage={searchTerm ? t('common.noResults') : t('suppliers.noResults')}
        />
        
        {suppliers.length > 0 && totalPages > 1 && (
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
        title={editingId ? t('suppliers.edit') : t('suppliers.add')}
        size="md"
      >
        <SupplierForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowAddModal(false);
          }}
          isEditing={!!editingId}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSupplier(null);
          setPaymentHistory([]);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {selectedSupplier?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <span className="text-gray-900">{t('suppliers.payments.title')}</span>
              <span className="text-sm font-normal text-gray-500 block">
                {selectedSupplier?.name}
              </span>
            </div>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          {selectedSupplier && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">{t('suppliers.statistics.totalPurchases')}</p>
                <p className="text-xl font-bold text-blue-700">
                  ${(selectedSupplier.total_purchases || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-600 font-medium">{t('suppliers.statistics.totalPaid')}</p>
                <p className="text-xl font-bold text-green-700">
                  ${(selectedSupplier.total_paid || 0).toFixed(2)}
                </p>
              </div>
              <div className={`rounded-lg p-3 border ${
                selectedSupplier.balance > 0 ? 'bg-red-50 border-red-200' : 
                selectedSupplier.balance < 0 ? 'bg-green-50 border-green-200' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs font-medium ${
                  selectedSupplier.balance > 0 ? 'text-red-600' : 
                  selectedSupplier.balance < 0 ? 'text-green-600' : 
                  'text-gray-600'
                }`}>
                  {t('common.balance')}
                </p>
                <p className={`text-xl font-bold ${
                  selectedSupplier.balance > 0 ? 'text-red-700' : 
                  selectedSupplier.balance < 0 ? 'text-green-700' : 
                  'text-gray-700'
                }`}>
                  ${Math.abs(selectedSupplier.balance || 0).toFixed(2)}
                </p>
                <p className={`text-xs ${
                  selectedSupplier.balance > 0 ? 'text-red-500' : 
                  selectedSupplier.balance < 0 ? 'text-green-500' : 
                  'text-gray-400'
                }`}>
                  {selectedSupplier.balance > 0 ? t('suppliers.statistics.credit') : 
                   selectedSupplier.balance < 0 ? t('suppliers.statistics.debit') : 
                   t('suppliers.statistics.balanced')}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">{t('suppliers.table.lastPayment')}</p>
                <p className="text-lg font-bold text-purple-700">
                  {selectedSupplier.last_payment 
                    ? `$${parseFloat(selectedSupplier.last_payment.amount).toFixed(2)}`
                    : '—'}
                </p>
                {selectedSupplier.last_payment && (
                  <p className="text-xs text-purple-500">
                    {new Date(selectedSupplier.last_payment.payment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              {t('suppliers.payments.record')}
            </h4>
            <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="hidden" 
                name="supplier_id" 
                value={selectedSupplier?.id || ''} 
              />
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('suppliers.payments.amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  value={paymentFormData.amount}
                  onChange={handlePaymentInputChange}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('suppliers.payments.date')} *</label>
                <input
                  type="date"
                  name="payment_date"
                  value={paymentFormData.payment_date}
                  onChange={handlePaymentInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('suppliers.payments.method')} *</label>
                <select
                  name="payment_method"
                  value={paymentFormData.payment_method}
                  onChange={handlePaymentInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="cash">{t('payments.methods.cash')}</option>
                  <option value="bank_transfer">{t('payments.methods.bankTransfer')}</option>
                  <option value="check">{t('payments.methods.check')}</option>
                  <option value="credit_card">{t('payments.methods.creditCard')}</option>
                  <option value="online">{t('payments.methods.online')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('suppliers.payments.reference')}</label>
                <input
                  type="text"
                  name="reference_number"
                  value={paymentFormData.reference_number}
                  onChange={handlePaymentInputChange}
                  placeholder="Reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('suppliers.payments.notes')}</label>
                <input
                  type="text"
                  name="notes"
                  value={paymentFormData.notes}
                  onChange={handlePaymentInputChange}
                  placeholder={t('placeholders.enterDescription')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  loading={submitting}
                  size="sm"
                  className="w-full"
                >
                  {t('suppliers.payments.record')}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              {t('suppliers.payments.title')}
            </h4>
            {loadingPayments ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text={t('common.loading')} />
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('suppliers.payments.noPayments')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.amount')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.date')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.method')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.reference')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentHistory.map((payment, index) => {
                      const { color, label } = getPaymentMethodBadge(payment.payment_method);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-2 font-medium text-green-600">
                            ${parseFloat(payment.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {payment.reference_number || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td className="px-4 py-2 font-semibold text-gray-700" colSpan="1">{t('suppliers.payments.totalPaid')}</td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        ${paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2" colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('suppliers.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('suppliers.deleteConfirm', { name: deleteTarget?.name || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('suppliers.deleteWarning')}
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

export default Suppliers;