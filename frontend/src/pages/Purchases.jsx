// src/pages/Purchases.jsx
import { useState, useEffect } from 'react';
import { 
  FiEdit2, FiTrash2, FiPlus, FiEye, FiDollarSign, 
  FiCalendar, FiUser, FiPackage, FiSearch 
} from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchBar from '../components/common/SearchBar';
import PurchaseForm from '../components/purchases/PurchaseForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Purchases = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: '',
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchMedicines();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers?limit=100');
      const data = response.data.data || response.data || [];
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines?limit=100');
      const data = response.data.data || response.data || [];
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await api.get(`/purchases?${params.toString()}`);
      
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
      }
      
      setPurchases(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases');
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({ ...paymentFormData, [name]: value });
  };

  const handleSubmit = async (formDataToSend) => {
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/purchases/${editingId}`, formDataToSend);
        showToast(t('success.updated'), 'success');
      } else {
        const response = await api.post('/purchases', formDataToSend);
        showToast(t('success.created'), 'success');
      }

      await fetchPurchases();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const paymentData = {
        amount: parseFloat(paymentFormData.amount),
        payment_date: paymentFormData.payment_date,
        payment_method: paymentFormData.payment_method,
        reference_number: paymentFormData.reference_number || null,
        notes: paymentFormData.notes || null,
      };

      await api.post(`/purchases/${selectedPurchase.id}/pay`, paymentData);
      showToast(t('success.created'), 'success');
      
      await fetchPurchases();
      await fetchPurchaseDetail(selectedPurchase.id);
      
      setPaymentFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
      });
      setShowPaymentModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPurchaseDetail = async (id) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      setSelectedPurchase(response.data);
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching purchase detail:', error);
    }
  };

  const handleView = async (purchase) => {
    await fetchPurchaseDetail(purchase.id);
    setShowDetailModal(true);
  };

  const handleAddPayment = (purchase) => {
    setSelectedPurchase(purchase);
    setPaymentFormData({
      amount: purchase.balance_due > 0 ? purchase.balance_due : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handleDeleteClick = (purchase) => {
    setDeleteTarget(purchase);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/purchases/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchPurchases();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || t('errors.generic'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      purchase_date: new Date().toISOString().split('T')[0],
      due_date: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
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

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { bg: 'bg-green-100 text-green-800', label: t('common.paid') },
      partial: { bg: 'bg-yellow-100 text-yellow-800', label: t('common.partial') },
      unpaid: { bg: 'bg-red-100 text-red-800', label: t('common.unpaid') },
    };
    const { bg, label } = statusMap[status] || statusMap.unpaid;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bg}`}>{label}</span>;
  };

  const columns = [
    {
      header: t('purchases.table.invoice'),
      key: 'invoice_number',
      render: (item) => (
        <span className="font-medium text-blue-600">{item.invoice_number}</span>
      )
    },
    {
      header: t('purchases.table.supplier'),
      key: 'supplier',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
            {item.supplier?.name?.charAt(0) || 'S'}
          </div>
          <span className="text-gray-700">{item.supplier?.name}</span>
        </div>
      )
    },
    {
      header: t('purchases.table.date'),
      key: 'purchase_date',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {new Date(item.purchase_date).toLocaleDateString()}
        </span>
      )
    },
    {
      header: t('purchases.table.total'),
      key: 'total',
      render: (item) => (
        <span className="font-semibold text-gray-900">${parseFloat(item.total).toFixed(2)}</span>
      )
    },
    {
      header: t('purchases.table.paid'),
      key: 'paid_amount',
      render: (item) => (
        <span className="text-green-600">${parseFloat(item.paid_amount).toFixed(2)}</span>
      )
    },
    {
      header: t('purchases.table.balance'),
      key: 'balance_due',
      render: (item) => (
        <span className={`font-semibold ${parseFloat(item.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ${parseFloat(item.balance_due).toFixed(2)}
        </span>
      )
    },
    {
      header: t('purchases.table.status'),
      key: 'payment_status',
      render: (item) => getStatusBadge(item.payment_status)
    },
    {
      header: t('purchases.table.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleView(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title={t('common.view')}
          >
            <FiEye size={16} />
          </button>
          {parseFloat(item.balance_due) > 0 && (
            <button
              onClick={() => handleAddPayment(item)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title={t('purchases.payment.title')}
            >
              <FiDollarSign size={16} />
            </button>
          )}
          <button
            onClick={() => handleDeleteClick(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title={t('common.delete')}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
      width: '130px'
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
          <Button onClick={fetchPurchases}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  const totalAmount = purchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
  const totalPaid = purchases.reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0);
  const totalBalance = purchases.reduce((sum, p) => sum + parseFloat(p.balance_due || 0), 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('purchases.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('purchases.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          icon={<FiPlus size={18} />}
        >
          {t('purchases.new')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('purchases.statistics.totalPurchases')}</p>
          <p className="text-2xl font-bold text-gray-800">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('purchases.statistics.totalPaid')}</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('purchases.statistics.totalBalance')}</p>
          <p className="text-2xl font-bold text-red-600">${totalBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t('purchases.searchPlaceholder')}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="sm:w-48">
            <Select
              name="filterStatus"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: t('reports.allStatus') },
                { value: 'paid', label: t('common.paid') },
                { value: 'partial', label: t('common.partial') },
                { value: 'unpaid', label: t('common.unpaid') },
              ]}
              className="!mb-0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={purchases}
          emptyMessage={t('purchases.noResults')}
        />
        
        {purchases.length > 0 && totalPages > 1 && (
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
        title={editingId ? t('purchases.edit') : t('purchases.new')}
        size="lg"
      >
        <PurchaseForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowAddModal(false);
          }}
          suppliers={suppliers}
          medicines={medicines}
          isEditing={!!editingId}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPurchase(null);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600" size={20} />
            </div>
            <div>
              <span className="text-gray-900">{selectedPurchase?.invoice_number}</span>
              <span className="text-sm font-normal text-gray-500 block">
                {selectedPurchase?.supplier?.name}
              </span>
            </div>
          </div>
        }
        size="lg"
      >
        {selectedPurchase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('common.total')}</p>
                <p className="text-lg font-bold text-gray-800">${parseFloat(selectedPurchase.total).toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600">{t('common.paid')}</p>
                <p className="text-lg font-bold text-green-600">${parseFloat(selectedPurchase.paid_amount).toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600">{t('common.balance')}</p>
                <p className="text-lg font-bold text-red-600">${parseFloat(selectedPurchase.balance_due).toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">{t('common.status')}</p>
                <div className="mt-1">{getStatusBadge(selectedPurchase.payment_status)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('purchases.fields.items')}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t('medicines.table.medicine')}</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">{t('common.quantity') || 'Qty'}</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">{t('common.unitPrice') || 'Unit Price'}</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">{t('common.total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPurchase.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{item.medicine?.generic || 'Unknown'}</td>
                        <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-700">${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">${parseFloat(item.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-3 py-2 text-right font-medium">{t('purchases.fields.subtotal')}:</td>
                      <td className="px-3 py-2 text-right font-medium">${parseFloat(selectedPurchase.subtotal).toFixed(2)}</td>
                    </tr>
                    {parseFloat(selectedPurchase.discount) > 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right text-red-600">{t('purchases.fields.discount')}:</td>
                        <td className="px-3 py-2 text-right text-red-600">-${parseFloat(selectedPurchase.discount).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedPurchase.tax) > 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right text-blue-600">{t('purchases.fields.tax')}:</td>
                        <td className="px-3 py-2 text-right text-blue-600">+${parseFloat(selectedPurchase.tax).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td colSpan="3" className="px-3 py-2 text-right text-gray-800">{t('purchases.fields.total')}:</td>
                      <td className="px-3 py-2 text-right text-gray-800">${parseFloat(selectedPurchase.total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedPurchase.payments?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('suppliers.payments.title')}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t('common.date')}</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">{t('common.amount')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t('common.method')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">{t('common.reference')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPurchase.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">
                            ${parseFloat(payment.amount).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-gray-600 capitalize">{payment.payment_method}</td>
                          <td className="px-3 py-2 text-gray-500">{payment.reference_number || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedPurchase.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('common.notes')}</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPurchase.notes}</p>
              </div>
            )}

            {parseFloat(selectedPurchase.balance_due) > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleAddPayment(selectedPurchase);
                  }}
                  icon={<FiDollarSign size={18} />}
                >
                  {t('purchases.payment.title')} (${parseFloat(selectedPurchase.balance_due).toFixed(2)})
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentFormData({
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            reference_number: '',
            notes: '',
          });
        }}
        title={t('purchases.payment.title')}
        size="md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {selectedPurchase && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('common.invoice')}:</span>
                <span className="font-medium">{selectedPurchase.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('purchases.fields.supplier')}:</span>
                <span className="font-medium">{selectedPurchase.supplier?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('purchases.payment.balanceDue')}:</span>
                <span className="font-bold text-red-600">${parseFloat(selectedPurchase.balance_due).toFixed(2)}</span>
              </div>
            </div>
          )}

          <Input
            label={t('purchases.payment.amount')}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={paymentFormData.amount}
            onChange={handlePaymentInputChange}
            placeholder={t('placeholders.enterAmount')}
            required
            icon={<FiDollarSign className="text-gray-400" size={18} />}
          />

          <Input
            label={t('purchases.payment.date')}
            name="payment_date"
            type="date"
            value={paymentFormData.payment_date}
            onChange={handlePaymentInputChange}
            required
            icon={<FiCalendar className="text-gray-400" size={18} />}
          />

          <Select
            label={t('purchases.payment.method')}
            name="payment_method"
            value={paymentFormData.payment_method}
            onChange={handlePaymentInputChange}
            options={[
              { value: 'cash', label: t('payments.methods.cash') },
              { value: 'bank_transfer', label: t('payments.methods.bankTransfer') },
              { value: 'check', label: t('payments.methods.check') },
              { value: 'credit_card', label: t('payments.methods.creditCard') },
              { value: 'online', label: t('payments.methods.online') },
            ]}
            required
          />

          <Input
            label={t('purchases.payment.reference')}
            name="reference_number"
            value={paymentFormData.reference_number}
            onChange={handlePaymentInputChange}
            placeholder={t('placeholders.enterDescription')}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('purchases.payment.notes')}
            </label>
            <textarea
              name="notes"
              value={paymentFormData.notes}
              onChange={handlePaymentInputChange}
              placeholder={t('placeholders.enterDescription')}
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentFormData({
                  amount: '',
                  payment_date: new Date().toISOString().split('T')[0],
                  payment_method: 'cash',
                  reference_number: '',
                  notes: '',
                });
              }}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {t('purchases.payment.title')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('purchases.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('purchases.deleteConfirm', { invoice: deleteTarget?.invoice_number || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('purchases.deleteWarning')}
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

export default Purchases;