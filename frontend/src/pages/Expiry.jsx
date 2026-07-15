// src/pages/Expiry.jsx
import { useState, useEffect } from 'react';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock,
  FiCalendar,
  FiPackage,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Expiry = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    expired: 0,
    near_expiry: 0,
    valid: 0,
  });

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, filter]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('limit', 100);
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('expiry_filter', filter);
      
      const response = await api.get(`/medicines?${params.toString()}`);
      
      let data = [];
      let statsData = {
        total: 0,
        expired: 0,
        near_expiry: 0,
        valid: 0,
      };
      
      if (response.data && response.data.data) {
        data = response.data.data;
        statsData = response.data.expiry_stats || statsData;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setMedicines(data);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return { label: t('medicines.expiry.noDate'), color: 'bg-gray-100 text-gray-800', icon: <FiClock className="text-gray-500" /> };
    }
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { 
        label: t('medicines.expiry.expired'), 
        color: 'bg-red-100 text-red-800',
        icon: <FiAlertCircle className="text-red-500" />,
        days: daysUntilExpiry
      };
    }
    if (daysUntilExpiry <= 30) {
      return { 
        label: `${t('medicines.expiry.nearExpiry')} (${daysUntilExpiry}d)`, 
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FiAlertCircle className="text-yellow-500" />,
        days: daysUntilExpiry
      };
    }
    return { 
      label: t('medicines.expiry.valid'), 
      color: 'bg-green-100 text-green-800',
      icon: <FiCheckCircle className="text-green-500" />,
      days: daysUntilExpiry
    };
  };

  const getStatusBadge = (stock) => {
    const numStock = parseInt(stock) || 0;
    if (numStock <= 0) {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">{t('medicines.status.outOfStock')}</span>;
    }
    if (numStock <= 5) {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">{t('medicines.status.lowStock')}</span>;
    }
    return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">{t('medicines.status.inStock')}</span>;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    {
      header: t('expiry.table.medicine'),
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
      header: t('expiry.table.batch'),
      key: 'batch_number',
      render: (item) => (
        <span className="text-gray-600 text-sm">{item.batch_number || '—'}</span>
      )
    },
    {
      header: t('expiry.table.stock'),
      key: 'stock',
      render: (item) => (
        <div>
          <span className="font-bold text-gray-800">{item.stock || 0}</span>
          <div className="mt-1">{getStatusBadge(item.stock)}</div>
        </div>
      )
    },
    {
      header: t('expiry.table.expiryDate'),
      key: 'expiry_date',
      render: (item) => {
        const status = getExpiryStatus(item.expiry_date);
        return (
          <div>
            <span className={`px-2 py-0.5 text-xs rounded-full inline-flex items-center gap-1 ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(item.expiry_date)}
            </div>
          </div>
        );
      }
    },
    {
      header: t('expiry.table.daysUntil'),
      key: 'days_until_expiry',
      render: (item) => {
        if (!item.expiry_date) return <span className="text-gray-400">—</span>;
        const today = new Date();
        const expiry = new Date(item.expiry_date);
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (days < 0) {
          return <span className="text-red-600 font-bold">{t('medicines.expiry.expired')}</span>;
        }
        if (days <= 30) {
          return <span className="text-yellow-600 font-bold">{days} {t('common.days') || 'days'}</span>;
        }
        return <span className="text-green-600">{days} {t('common.days') || 'days'}</span>;
      }
    },
    {
      header: t('expiry.table.sellingPrice'),
      key: 'selling_price',
      render: (item) => (
        <span className="font-medium text-green-600">
          ${parseFloat(item.selling_price || 0).toFixed(2)}
        </span>
      )
    },
  ];

  const filterOptions = [
    { value: 'all', label: t('expiry.filters.all') },
    { value: 'expired', label: t('expiry.filters.expired') },
    { value: 'near_expiry', label: t('expiry.filters.nearExpiry') },
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
            <FiCalendar className="text-blue-600" />
            {t('expiry.title')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('expiry.subtitle')}</p>
        </div>
        <Button
          onClick={fetchMedicines}
          variant="secondary"
          icon={<FiRefreshCw size={18} />}
        >
          {t('expiry.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('expiry.statistics.totalMedicines')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiPackage size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('expiry.statistics.valid')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiCheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('expiry.statistics.nearExpiry')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.near_expiry}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <FiClock size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('expiry.statistics.expired')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <FiAlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('expiry.searchPlaceholder')}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={medicines}
          emptyMessage={
            searchTerm 
              ? t('common.noResults')
              : filter !== 'all'
              ? t('expiry.noResults')
              : t('common.noData')
          }
        />
      </div>

      {stats.expired > 0 && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-red-500 text-xl" />
            <div>
              <p className="text-red-700 font-medium">
                {t('expiry.alerts.expired', { count: stats.expired, plural: stats.expired > 1 ? 's' : '' })}
              </p>
              <p className="text-red-600 text-sm">
                {t('expiry.alerts.expiredMessage')}
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.near_expiry > 0 && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FiClock className="text-yellow-500 text-xl" />
            <div>
              <p className="text-yellow-700 font-medium">
                {t('expiry.alerts.nearExpiry', { count: stats.near_expiry, plural: stats.near_expiry > 1 ? 's' : '' })}
              </p>
              <p className="text-yellow-600 text-sm">
                {t('expiry.alerts.nearExpiryMessage')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expiry;