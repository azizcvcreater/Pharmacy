// src/pages/Sales.jsx
import { useState, useEffect } from 'react';
import { 
  FiEdit2, FiTrash2, FiPlus, FiEye, FiDollarSign, 
  FiCalendar, FiUser, FiPackage, FiSearch, FiClipboard,
  FiUserPlus, FiPhone, FiUserCheck, FiBookOpen,
  FiDollarSign as FiMoney
} from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchBar from '../components/common/SearchBar';
import SaleForm from '../components/sales/SaleForm';
import SalePaymentForm from '../components/sales/SalePaymentForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Sales = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    sale_type: 'non_prescription',
    prescription_number: '',
    doctor_name: '',
    doctor_fees: 0,
    patient_name: '',
    patient_phone: '',
    prescription_image: null,
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paid_amount: 0,
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
    fetchSales();
    fetchMedicines();
  }, [currentPage, searchTerm, filterStatus, filterType]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines?limit=100');
      const data = response.data.data || response.data || [];
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('type', filterType);
      
      const response = await api.get(`/sales?${params.toString()}`);
      
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
      
      setSales(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales');
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
        await api.put(`/sales/${editingId}`, formDataToSend);
        showToast(t('success.updated'), 'success');
      } else {
        const response = await api.post('/sales', formDataToSend);
        showToast(t('success.created'), 'success');
      }

      await fetchSales();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const paymentData = {
        sale_id: selectedSale.id,
        amount: parseFloat(paymentFormData.amount),
        payment_date: paymentFormData.payment_date,
        payment_method: paymentFormData.payment_method,
        reference_number: paymentFormData.reference_number || null,
        notes: paymentFormData.notes || null,
      };

      await api.post('/sale-payments', paymentData);
      showToast(t('success.created'), 'success');
      
      await fetchSales();
      if (selectedSale) {
        await fetchSaleDetail(selectedSale.id);
      }
      
      setShowPaymentModal(false);
      setPaymentFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchSaleDetail = async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      setSelectedSale(response.data);
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching sale detail:', error);
    }
  };

  const handleView = async (sale) => {
    await fetchSaleDetail(sale.id);
    setShowDetailModal(true);
  };

  const handleAddPayment = (sale) => {
    setSelectedSale(sale);
    setPaymentFormData({
      amount: sale.balance_due > 0 ? sale.balance_due : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handleDeleteClick = (sale) => {
    setDeleteTarget(sale);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/sales/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchSales();
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
      sale_date: new Date().toISOString().split('T')[0],
      sale_type: 'non_prescription',
      prescription_number: '',
      doctor_name: '',
      doctor_fees: 0,
      patient_name: '',
      patient_phone: '',
      prescription_image: null,
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      paid_amount: 0,
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
      paid: { bg: 'bg-green-100 text-green-800', label: t('sales.status.paid') },
      partial: { bg: 'bg-yellow-100 text-yellow-800', label: t('sales.status.partial') },
      unpaid: { bg: 'bg-red-100 text-red-800', label: t('sales.status.unpaid') },
    };
    const { bg, label } = statusMap[status] || statusMap.unpaid;
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bg}`}>{label}</span>;
  };

  const getTypeBadge = (type) => {
    if (type === 'prescription') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">{t('sales.fields.prescription')}</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{t('sales.fields.nonPrescription')}</span>;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const columns = [
    {
      header: t('sales.table.invoice'),
      key: 'invoice_number',
      render: (item) => (
        <span className="font-medium text-green-600">{item.invoice_number}</span>
      )
    },
    {
      header: t('sales.table.type'),
      key: 'sale_type',
      render: (item) => getTypeBadge(item.sale_type)
    },
    {
      header: t('sales.table.patientDoctor'),
      key: 'patient',
      render: (item) => {
        if (item.sale_type === 'prescription') {
          return (
            <div>
              <div className="text-sm font-medium text-gray-800">{item.patient_name || 'N/A'}</div>
              <div className="text-xs text-gray-400">Dr. {item.doctor_name || 'N/A'}</div>
              {parseFloat(item.doctor_fees || 0) > 0 && (
                <div className="text-xs text-purple-600 font-medium">
                  {t('sales.fields.doctorFees')}: {formatCurrency(item.doctor_fees)}
                </div>
              )}
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">{t('sales.fields.nonPrescription')}</span>;
      }
    },
    {
      header: t('sales.table.date'),
      key: 'sale_date',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {new Date(item.sale_date).toLocaleDateString()}
        </span>
      )
    },
    {
      header: t('sales.table.total'),
      key: 'total',
      render: (item) => (
        <div>
          <span className="font-semibold text-gray-900">{formatCurrency(item.total)}</span>
          {parseFloat(item.doctor_fees || 0) > 0 && (
            <div className="text-xs text-purple-500">{t('sales.fields.doctorFees')}: {formatCurrency(item.doctor_fees)}</div>
          )}
        </div>
      )
    },
    {
      header: t('sales.table.paid'),
      key: 'paid_amount',
      render: (item) => (
        <span className="text-green-600">{formatCurrency(item.paid_amount)}</span>
      )
    },
    {
      header: t('sales.table.balance'),
      key: 'balance_due',
      render: (item) => (
        <span className={`font-semibold ${parseFloat(item.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(item.balance_due)}
        </span>
      )
    },
    {
      header: t('sales.table.status'),
      key: 'payment_status',
      render: (item) => getStatusBadge(item.payment_status)
    },
    {
      header: t('sales.table.actions'),
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
              title={t('sales.payment.title')}
            >
              <FiMoney size={16} />
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
          <Button onClick={fetchSales}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  const totalPaid = sales.reduce((sum, s) => sum + parseFloat(s.paid_amount || 0), 0);
  const totalBalance = sales.reduce((sum, s) => sum + parseFloat(s.balance_due || 0), 0);
  const totalDoctorFees = sales.reduce((sum, s) => sum + parseFloat(s.doctor_fees || 0), 0);
  const prescriptionCount = sales.filter(s => s.sale_type === 'prescription').length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('sales.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('sales.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          icon={<FiPlus size={18} />}
          variant="success"
        >
          {t('sales.new')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('sales.statistics.totalSales')}</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('sales.statistics.totalPaid')}</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('sales.statistics.totalBalance')}</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('sales.statistics.doctorFees')}</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalDoctorFees)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('sales.statistics.prescriptions')}</p>
          <p className="text-2xl font-bold text-purple-600">{prescriptionCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t('sales.searchPlaceholder')}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="sm:w-48">
            <Select
              name="filterType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: t('reports.allTypes') },
                { value: 'prescription', label: t('sales.fields.prescription') },
                { value: 'non_prescription', label: t('sales.fields.nonPrescription') },
              ]}
              className="!mb-0"
              placeholder={t('common.select')}
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
                { value: 'paid', label: t('sales.status.paid') },
                { value: 'partial', label: t('sales.status.partial') },
                { value: 'unpaid', label: t('sales.status.unpaid') },
              ]}
              className="!mb-0"
              placeholder={t('common.select')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={sales}
          emptyMessage={t('sales.noResults')}
        />
        
        {sales.length > 0 && totalPages > 1 && (
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
        title={editingId ? t('sales.edit') : t('sales.new')}
        size="lg"
      >
        <SaleForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowAddModal(false);
          }}
          medicines={medicines}
          isEditing={!!editingId}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSale(null);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPackage className="text-green-600" size={20} />
            </div>
            <div>
              <span className="text-gray-900">{selectedSale?.invoice_number}</span>
              <span className="text-sm font-normal text-gray-500 block">
                {selectedSale?.sale_type === 'prescription' ? t('sales.fields.prescription') : t('sales.fields.nonPrescription')}
              </span>
            </div>
          </div>
        }
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('common.total')}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedSale.total)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600">{t('common.paid')}</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(selectedSale.paid_amount)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600">{t('common.balance')}</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(selectedSale.balance_due)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600">{t('sales.fields.doctorFees')}</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(selectedSale.doctor_fees)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">{t('common.status')}</p>
                <div className="mt-1">{getStatusBadge(selectedSale.payment_status)}</div>
              </div>
            </div>

            {selectedSale.sale_type === 'prescription' && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <FiClipboard className="text-purple-600" />
                  {t('sales.fields.prescription')}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">{t('sales.fields.prescriptionNumber')}:</span>
                    <span className="ml-2 font-medium">{selectedSale.prescription_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('sales.fields.doctorName')}:</span>
                    <span className="ml-2 font-medium">{selectedSale.doctor_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('sales.fields.doctorFees')}:</span>
                    <span className="ml-2 font-medium text-purple-600">{formatCurrency(selectedSale.doctor_fees)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('sales.fields.patientName')}:</span>
                    <span className="ml-2 font-medium">{selectedSale.patient_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('sales.fields.patientPhone')}:</span>
                    <span className="ml-2 font-medium">{selectedSale.patient_phone || 'N/A'}</span>
                  </div>
                </div>
                {selectedSale.prescription_image && (
                  <div className="mt-3">
                    <img 
                      src={selectedSale.prescription_image} 
                      alt="Prescription" 
                      className="max-h-48 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiPackage className="text-gray-500" size={16} />
                {t('sales.fields.items')}
              </h4>
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
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{item.medicine?.generic || 'Unknown'}</td>
                        <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-3 py-2 text-right font-medium">{t('sales.fields.subtotal')}:</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(selectedSale.subtotal)}</td>
                    </tr>
                    {parseFloat(selectedSale.discount) > 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right text-red-600">{t('sales.fields.discount')}:</td>
                        <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(selectedSale.discount)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedSale.tax) > 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right text-blue-600">{t('sales.fields.tax')}:</td>
                        <td className="px-3 py-2 text-right text-blue-600">+{formatCurrency(selectedSale.tax)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedSale.doctor_fees) > 0 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right text-purple-600">{t('sales.fields.doctorFees')}:</td>
                        <td className="px-3 py-2 text-right text-purple-600">+{formatCurrency(selectedSale.doctor_fees)}</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td colSpan="3" className="px-3 py-2 text-right text-gray-800">{t('sales.fields.total')}:</td>
                      <td className="px-3 py-2 text-right text-gray-800">{formatCurrency(selectedSale.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedSale.payments && selectedSale.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiBookOpen className="text-gray-500" size={16} />
                  {t('suppliers.payments.title')} ({selectedSale.payments.length} {t('common.records')})
                </h4>
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
                      {selectedSale.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-3 py-2 text-gray-600 capitalize">{payment.payment_method}</td>
                          <td className="px-3 py-2 text-gray-500">{payment.reference_number || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td className="px-3 py-2 font-semibold text-gray-700">{t('suppliers.payments.totalPaid')}</td>
                        <td className="px-3 py-2 text-right font-bold text-green-600">
                          {formatCurrency(selectedSale.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {selectedSale.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('common.notes')}</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedSale.notes}</p>
              </div>
            )}

            {parseFloat(selectedSale.balance_due) > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleAddPayment(selectedSale);
                  }}
                  icon={<FiMoney size={18} />}
                  variant="success"
                >
                  {t('sales.payment.title')} ({formatCurrency(selectedSale.balance_due)})
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
          setSelectedSale(null);
          setPaymentFormData({
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            reference_number: '',
            notes: '',
          });
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiMoney className="text-green-600" size={20} />
            </div>
            <div>
              <span className="text-gray-900">{t('sales.payment.title')}</span>
              <span className="text-sm font-normal text-gray-500 block">
                {selectedSale?.invoice_number}
              </span>
            </div>
          </div>
        }
        size="md"
      >
        <SalePaymentForm
          formData={paymentFormData}
          onChange={handlePaymentInputChange}
          onSubmit={handlePaymentSubmit}
          onCancel={() => {
            setShowPaymentModal(false);
            setPaymentFormData({
              amount: '',
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: 'cash',
              reference_number: '',
              notes: '',
            });
          }}
          loading={paymentLoading}
          balanceDue={selectedSale?.balance_due || 0}
          invoiceNumber={selectedSale?.invoice_number || ''}
        />
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('sales.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('sales.deleteConfirm', { invoice: deleteTarget?.invoice_number || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('sales.deleteWarning')}
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

export default Sales;