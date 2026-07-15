// src/pages/Medicines.jsx
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MedicineForm from '../components/medicines/MedicineForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/ToastContainer';

const Medicines = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    generic: '',
    brand: '',
    dosage: '',
    strength: '',
    route: '',
    stock: 0,
    purchase_price: 0,
    selling_price: 0,
    expiry_date: '',
    batch_number: '',
  });

  useEffect(() => {
    fetchMedicines();
  }, [currentPage, searchTerm]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/medicines?${params.toString()}`);
      
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
      
      setMedicines(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again.');
      showToast(t('errors.generic'), 'error');
      setMedicines([]);
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
      const submitData = {
        ...formData,
        stock: parseInt(formData.stock) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
      };

      if (editingId) {
        await api.put(`/medicines/${editingId}`, submitData);
        showToast(t('success.updated'), 'success');
      } else {
        await api.post('/medicines', submitData);
        showToast(t('success.created'), 'success');
      }

      await fetchMedicines();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || t('errors.generic'), 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (medicine) => {
    setFormData({
      generic: medicine.generic || '',
      brand: medicine.brand || '',
      dosage: medicine.dosage || '',
      strength: medicine.strength || '',
      route: medicine.route || '',
      stock: medicine.stock || 0,
      purchase_price: medicine.purchase_price || 0,
      selling_price: medicine.selling_price || 0,
      expiry_date: medicine.expiry_date || '',
      batch_number: medicine.batch_number || '',
    });
    setEditingId(medicine.id);
    setShowAddModal(true);
  };

  const handleDeleteClick = (medicine) => {
    setDeleteTarget(medicine);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/medicines/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchMedicines();
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
      generic: '',
      brand: '',
      dosage: '',
      strength: '',
      route: '',
      stock: 0,
      purchase_price: 0,
      selling_price: 0,
      expiry_date: '',
      batch_number: '',
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

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '0.00';
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getStockStatus = (stock) => {
    const numStock = parseInt(stock) || 0;
    if (numStock <= 0) return { label: t('medicines.status.outOfStock'), color: 'bg-red-100 text-red-800' };
    if (numStock <= 5) return { label: t('medicines.status.lowStock'), color: 'bg-yellow-100 text-yellow-800' };
    return { label: t('medicines.status.inStock'), color: 'bg-green-100 text-green-800' };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { label: t('medicines.expiry.noDate'), color: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { label: t('medicines.expiry.expired'), color: 'bg-red-100 text-red-800' };
    if (daysUntilExpiry <= 30) return { label: `${t('medicines.expiry.nearExpiry')} (${daysUntilExpiry}d)`, color: 'bg-yellow-100 text-yellow-800' };
    return { label: t('medicines.expiry.valid'), color: 'bg-green-100 text-green-800' };
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
      header: t('medicines.table.medicine'),
      key: 'generic',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {item.generic?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium text-gray-900">{item.generic}</span>
            <div className="text-xs text-gray-400">{item.brand}</div>
          </div>
        </div>
      )
    },
    {
      header: t('medicines.table.details'),
      key: 'details',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-100">
            {item.dosage}
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium border border-green-100">
            {item.strength}mg
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-medium border border-purple-100">
            {item.route}
          </span>
        </div>
      )
    },
    {
      header: t('medicines.table.stock'),
      key: 'stock',
      render: (item) => {
        const stock = parseInt(item.stock) || 0;
        const status = getStockStatus(stock);
        return (
          <div>
            <span className="font-bold text-gray-800">{stock}</span>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        );
      }
    },
    {
      header: t('medicines.table.expiry'),
      key: 'expiry_date',
      render: (item) => {
        const status = getExpiryStatus(item.expiry_date);
        return (
          <div>
            <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
              {status.label}
            </span>
            {item.expiry_date && (
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(item.expiry_date).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('medicines.table.purchasePrice'),
      key: 'purchase_price',
      render: (item) => (
        <span className="text-gray-600">${formatPrice(item.purchase_price)}</span>
      )
    },
    {
      header: t('medicines.table.sellingPrice'),
      key: 'selling_price',
      render: (item) => (
        <span className="font-medium text-green-600">${formatPrice(item.selling_price)}</span>
      )
    },
    {
      header: t('medicines.table.actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
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
      width: '100px'
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
          <Button onClick={fetchMedicines}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('medicines.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('medicines.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          {t('medicines.add')}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder={t('medicines.searchPlaceholder')}
          onClear={() => {
            setSearchTerm('');
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={medicines}
          emptyMessage={searchTerm ? t('common.noResults') : t('medicines.noResults')}
        />
        
        {medicines.length > 0 && totalPages > 1 && (
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
        title={editingId ? t('medicines.edit') : t('medicines.add')}
        size="lg"
      >
        <MedicineForm
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('medicines.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('medicines.deleteConfirm', { name: deleteTarget?.generic || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('medicines.deleteWarning')}
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

export default Medicines;