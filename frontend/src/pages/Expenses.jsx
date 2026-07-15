// src/pages/Expenses.jsx
import { useState, useEffect } from 'react';
import { 
  FiEdit2, FiTrash2, FiPlus, FiEye, FiDollarSign, 
  FiCalendar, FiSearch, FiFilter, FiRefreshCw,
  FiDownload, FiImage
} from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Expenses = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [summary, setSummary] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    receipt_image: null,
    receipt_image_preview: null,
  });

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, [currentPage, searchTerm, filterCategory, filterPeriod]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      
      if (filterPeriod) {
        const now = new Date();
        let fromDate, toDate;
        switch (filterPeriod) {
          case 'today':
            fromDate = new Date(now);
            toDate = new Date(now);
            break;
          case 'this_week':
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            fromDate = start;
            toDate = end;
            break;
          case 'this_month':
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'this_year':
            fromDate = new Date(now.getFullYear(), 0, 1);
            toDate = new Date(now.getFullYear(), 11, 31);
            break;
        }
        if (fromDate && toDate) {
          params.append('from_date', fromDate.toISOString().split('T')[0]);
          params.append('to_date', toDate.toISOString().split('T')[0]);
        }
      }
      
      const response = await api.get(`/expenses?${params.toString()}`);
      
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
      
      setExpenses(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/expenses/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt_image' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          receipt_image: file,
          receipt_image_preview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('expense_date', formData.expense_date);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description || '');
      
      if (formData.receipt_image) {
        formDataToSend.append('receipt_image', formData.receipt_image);
      }

      if (editingId) {
        await api.post(`/expenses/${editingId}?_method=PUT`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast(t('success.updated'), 'success');
      } else {
        await api.post('/expenses', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast(t('success.created'), 'success');
      }

      await fetchExpenses();
      await fetchSummary();
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

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title || '',
      amount: expense.amount || '',
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      category: expense.category || '',
      description: expense.description || '',
      receipt_image: null,
      receipt_image_preview: expense.receipt_image ? 
        `/storage/receipts/${expense.receipt_image}` : null,
    });
    setEditingId(expense.id);
    setShowAddModal(true);
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (expense) => {
    setDeleteTarget(expense);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      showToast(t('success.deleted'), 'success');
      await fetchExpenses();
      await fetchSummary();
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
      title: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      receipt_image: null,
      receipt_image_preview: null,
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      rent: t('expenses.categories.rent'),
      utilities: t('expenses.categories.utilities'),
      salary: t('expenses.categories.salary'),
      inventory: t('expenses.categories.inventory'),
      maintenance: t('expenses.categories.maintenance'),
      marketing: t('expenses.categories.marketing'),
      transport: t('expenses.categories.transport'),
      insurance: t('expenses.categories.insurance'),
      tax: t('expenses.categories.tax'),
      other: t('expenses.categories.other'),
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      rent: 'bg-blue-100 text-blue-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      salary: 'bg-green-100 text-green-800',
      inventory: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-orange-100 text-orange-800',
      marketing: 'bg-pink-100 text-pink-800',
      transport: 'bg-indigo-100 text-indigo-800',
      insurance: 'bg-teal-100 text-teal-800',
      tax: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      rent: '🏢',
      utilities: '💡',
      salary: '👨‍💼',
      inventory: '📦',
      maintenance: '🔧',
      marketing: '📢',
      transport: '🚚',
      insurance: '🛡️',
      tax: '📊',
      other: '📋',
    };
    return icons[category] || '📋';
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
      header: t('expenses.table.title'),
      key: 'title',
      render: (item) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">{getCategoryIcon(item.category)}</span>
          <div>
            <span className="font-medium text-gray-900">{item.title}</span>
            {item.receipt_image && (
              <div className="text-xs text-blue-500">📎 {t('expenses.fields.receipt')}</div>
            )}
          </div>
        </div>
      )
    },
    {
      header: t('expenses.table.category'),
      key: 'category',
      render: (item) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
          {getCategoryLabel(item.category)}
        </span>
      )
    },
    {
      header: t('expenses.table.amount'),
      key: 'amount',
      render: (item) => (
        <span className="font-bold text-red-600">{formatCurrency(item.amount)}</span>
      )
    },
    {
      header: t('expenses.table.date'),
      key: 'expense_date',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {new Date(item.expense_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },
    {
      header: t('expenses.table.actions'),
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleView(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title={t('common.view')}
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title={t('common.edit')}
          >
            <FiEdit2 size={16} />
          </button>
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

  const categoryOptions = [
    { value: '', label: t('common.all') },
    { value: 'rent', label: `🏢 ${t('expenses.categories.rent')}` },
    { value: 'utilities', label: `💡 ${t('expenses.categories.utilities')}` },
    { value: 'salary', label: `👨‍💼 ${t('expenses.categories.salary')}` },
    { value: 'inventory', label: `📦 ${t('expenses.categories.inventory')}` },
    { value: 'maintenance', label: `🔧 ${t('expenses.categories.maintenance')}` },
    { value: 'marketing', label: `📢 ${t('expenses.categories.marketing')}` },
    { value: 'transport', label: `🚚 ${t('expenses.categories.transport')}` },
    { value: 'insurance', label: `🛡️ ${t('expenses.categories.insurance')}` },
    { value: 'tax', label: `📊 ${t('expenses.categories.tax')}` },
    { value: 'other', label: `📋 ${t('expenses.categories.other')}` },
  ];

  const periodOptions = [
    { value: '', label: t('common.all') },
    { value: 'today', label: t('dashboard.todaySales') },
    { value: 'this_week', label: t('dashboard.weeklySales') },
    { value: 'this_month', label: t('dashboard.monthlySales') },
    { value: 'this_year', label: t('reports.year') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiDollarSign className="text-red-600" />
            {t('expenses.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('expenses.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          icon={<FiPlus size={18} />}
        >
          {t('expenses.add')}
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{t('expenses.statistics.totalExpenses')}</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expenses)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{t('expenses.statistics.numberOfExpenses')}</p>
            <p className="text-2xl font-bold text-gray-800">{summary.expense_count}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{t('expenses.statistics.period')}</p>
            <p className="text-sm font-medium text-gray-600">
              {new Date(summary.start_date).toLocaleDateString()} - {new Date(summary.end_date).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">{t('expenses.statistics.categories')}</p>
            <p className="text-2xl font-bold text-gray-800">
              {Object.keys(summary.expenses_by_category || {}).length}
            </p>
          </div>
        </div>
      )}

      {summary && summary.expenses_by_category && Object.keys(summary.expenses_by_category).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('expenses.statistics.expensesByCategory')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(summary.expenses_by_category).map(([category, amount]) => (
              <div key={category} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <div>
                  <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t('expenses.searchPlaceholder')}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="sm:w-48">
            <Select
              name="filterCategory"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              options={categoryOptions}
              className="!mb-0"
            />
          </div>
          <div className="sm:w-48">
            <Select
              name="filterPeriod"
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                setCurrentPage(1);
              }}
              options={periodOptions}
              className="!mb-0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={expenses}
          emptyMessage={
            searchTerm || filterCategory || filterPeriod
              ? t('expenses.noResults')
              : t('common.noData')
          }
        />
        
        {expenses.length > 0 && totalPages > 1 && (
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
        title={editingId ? t('expenses.edit') : t('expenses.add')}
        size="md"
      >
        <ExpenseForm
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
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedExpense(null);
        }}
        title={t('common.details')}
        size="md"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t('expenses.fields.title')}</p>
                <p className="font-medium text-gray-900">{selectedExpense.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('expenses.fields.amount')}</p>
                <p className="font-bold text-red-600">{formatCurrency(selectedExpense.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('expenses.fields.category')}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedExpense.category)}`}>
                  {getCategoryLabel(selectedExpense.category)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('expenses.fields.date')}</p>
                <p className="text-gray-700">
                  {new Date(selectedExpense.expense_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {selectedExpense.description && (
              <div>
                <p className="text-xs text-gray-500">{t('expenses.fields.description')}</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
              </div>
            )}

            {selectedExpense.receipt_image && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{t('expenses.fields.receipt')}</p>
                <img 
                  src={`/storage/receipts/${selectedExpense.receipt_image}`}
                  alt="Receipt"
                  className="max-h-64 rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">{t('common.createdAt') || 'Created At'}</p>
              <p className="text-sm text-gray-600">
                {new Date(selectedExpense.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('expenses.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('expenses.deleteConfirm', { title: deleteTarget?.title || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('expenses.deleteWarning')}
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

export default Expenses;