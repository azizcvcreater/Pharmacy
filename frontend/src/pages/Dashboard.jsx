import { useEffect, useState } from 'react';
import api from '../api';
import {
  FaShoppingCart,
  FaCoins,
  FaMoneyBillWave,
  FaChartLine,
  FaStethoscope,
  FaHeartbeat,
  FaXRay,
  FaProcedures,
  FaDollarSign,
} from 'react-icons/fa';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { DashboardCard } from '../components/DashboardCard';
import { LowStockCard } from '../components/LowStockCard';
import { LowStockModal } from '../components/LowStockModal';
import { DashboardCharts } from '../components/DashboardCharts';
import { NearExpiryCard } from '../components/NearExpiryCard';
import { NearExpiryModal } from '../components/NearExpiryModal';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [showNearExpiryModal, setShowNearExpiryModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        setDashboard(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setError('Unable to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openLowStockModal = () => setShowLowStockModal(true);
  const closeLowStockModal = () => setShowLowStockModal(false);
  const openNearExpiryModal = () => setShowNearExpiryModal(true);
  const closeNearExpiryModal = () => setShowNearExpiryModal(false);

  return (
    <div className='overflow-x-auto modern-scrollbar'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Dashboard</h1>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4'>
          {error}
        </div>
      )}

      {/* First row: existing metrics */}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {loading ? (
          <div className='col-span-full flex justify-center py-12'>
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <DashboardCard
              title='Total Purchases'
              value={formatNumber(dashboard?.totalPurchases)}
              icon={FaShoppingCart}
              iconColor='text-blue-500'
              valueColor='text-blue-600'
            />
            <DashboardCard
              title='Total Profit'
              value={formatNumber(dashboard?.totalProfit)}
              icon={FaCoins}
              iconColor='text-green-500'
              valueColor='text-green-600'
            />
            <DashboardCard
              title='Total Expenses'
              value={formatNumber(dashboard?.totalExpenses)}
              icon={FaMoneyBillWave}
              iconColor='text-red-500'
              valueColor='text-red-600'
            />
            <DashboardCard
              title='Net Profit'
              value={formatNumber(dashboard?.netProfit)}
              icon={FaChartLine}
              iconColor='text-purple-500'
              valueColor='text-purple-600'
            />
            <LowStockCard
              count={dashboard?.lowStock?.length || 0}
              onClick={openLowStockModal}
            />
            <NearExpiryCard
              count={dashboard?.nearExpiry?.length || 0}
              onClick={openNearExpiryModal}
            />
          </>
        )}
      </div>

      {/* Second row: Doctor income totals */}
      {!loading && dashboard && (
        <div className='my-8'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>
            Doctor Income Summary
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
            <DashboardCard
              title='Consultation Fees'
              value={formatNumber(dashboard?.totalConsultationFees)}
              icon={FaStethoscope}
              iconColor='text-indigo-500'
              valueColor='text-indigo-600'
            />
            <DashboardCard
              title='Sonography Fees'
              value={formatNumber(dashboard?.totalSonographyFees)}
              icon={FaProcedures}
              iconColor='text-blue-500'
              valueColor='text-blue-600'
            />
            <DashboardCard
              title='ECG Fees'
              value={formatNumber(dashboard?.totalEcgFees)}
              icon={FaHeartbeat}
              iconColor='text-green-500'
              valueColor='text-green-600'
            />
            <DashboardCard
              title='X‑ray Fees'
              value={formatNumber(dashboard?.totalXrayFees)}
              icon={FaXRay}
              iconColor='text-purple-500'
              valueColor='text-purple-600'
            />
            <DashboardCard
              title='Total Doctor Income'
              value={formatNumber(dashboard?.totalDoctorIncome)}
              icon={FaDollarSign}
              iconColor='text-yellow-500'
              valueColor='text-yellow-600'
              gradient={true} // optional special styling
            />
          </div>
        </div>
      )}

      <DashboardCharts />

      {showLowStockModal && (
        <LowStockModal
          items={dashboard?.lowStock || []}
          onClose={closeLowStockModal}
          formatDate={formatDate}
        />
      )}
      {showNearExpiryModal && (
        <NearExpiryModal
          items={dashboard?.nearExpiry || []}
          onClose={closeNearExpiryModal}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
