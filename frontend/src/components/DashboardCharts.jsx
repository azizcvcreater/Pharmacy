import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api';
import { LoadingSpinner } from './LoadingSpinner';

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to format date for axis
const formatAxisDate = (dateStr, range) => {
  if (range === 'daily') {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (range === 'weekly') {
    return dateStr;
  } else if (range === 'monthly') {
    return dateStr;
  } else {
    return dateStr;
  }
};

// Map API response to chart data
const mapResponseToChartData = (data, range) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    if (range === 'daily') {
      return {
        date: item.date,
        purchases: Number(item.purchases) || 0,
        sales: Number(item.sales) || 0,
        profit: Number(item.profit) || 0,
        expenses: Number(item.expenses) || 0,
      };
    } else if (range === 'weekly') {
      return {
        date: item.week || item.date,
        purchases: Number(item.purchases) || 0,
        sales: Number(item.sales) || 0,
        profit: Number(item.profit) || 0,
        expenses: Number(item.expenses) || 0,
      };
    } else if (range === 'monthly') {
      return {
        date: item.month,
        purchases: Number(item.purchases) || 0,
        sales: Number(item.sales) || 0,
        profit: Number(item.profit) || 0,
        expenses: Number(item.expenses) || 0,
      };
    } else {
      return {
        date: item.year,
        purchases: Number(item.purchases) || 0,
        sales: Number(item.sales) || 0,
        profit: Number(item.profit) || 0,
        expenses: Number(item.expenses) || 0,
      };
    }
  });
};

// Loading skeleton component
const ChartSkeleton = () => (
  <div className='animate-pulse space-y-4'>
    <div className='h-8 bg-gray-200 rounded w-1/3'></div>
    <div className='h-64 bg-gray-200 rounded'></div>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='h-16 bg-gray-200 rounded'></div>
      ))}
    </div>
  </div>
);

export function DashboardCharts() {
  const [range, setRange] = useState('weekly'); // weekly is default
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState({
    purchases: 0,
    sales: 0,
    profit: 0,
    expenses: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError('');

      try {
        const endpoint = `/reports/${range}`;
        const response = await api.get(endpoint);
        const chartData = mapResponseToChartData(response.data, range);
        setData(chartData);

        const totalPurchases = chartData.reduce(
          (sum, d) => sum + d.purchases,
          0,
        );
        const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0);
        const totalProfit = chartData.reduce((sum, d) => sum + d.profit, 0);
        const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
        setTotals({
          purchases: totalPurchases,
          sales: totalSales,
          profit: totalProfit,
          expenses: totalExpenses,
        });
      } catch (err) {
        console.error('Failed to load chart data', err);
        setError('Unable to load chart data.');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [range, refreshKey]);

  const onRetry = () => setRefreshKey((k) => k + 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 shadow-xl rounded-xl border border-gray-100'>
          <p className='text-sm font-semibold text-gray-800 mb-2'>{label}</p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className='flex items-center justify-between gap-4 text-sm'
            >
              <span style={{ color: entry.color }} className='font-medium'>
                {entry.name}:
              </span>
              <span className='text-gray-900 font-semibold'>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
      {/* Header with gradient */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
            <span className='w-1 h-6 bg-blue-600 rounded-full'></span>
            Financial Performance Overview
          </h2>
          <div className='inline-flex rounded-lg shadow-sm' role='group'>
            {['daily', 'weekly', 'monthly', 'yearly'].map((option, idx) => {
              let roundedClass = '';
              if (idx === 0) roundedClass = 'rounded-l-lg';
              if (idx === 3) roundedClass = 'rounded-r-lg';
              return (
                <button
                  key={option}
                  onClick={() => setRange(option)}
                  className={`px-5 py-2 text-sm font-medium capitalize transition-all duration-200 
                    ${
                      range === option
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    } 
                    ${roundedClass}
                    border-r last:border-r-0 focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='p-6'>
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-500 mb-4'>{error}</p>
            <button
              onClick={onRetry}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                <p className='text-sm text-blue-600 font-medium'>
                  Total Purchases
                </p>
                <p className='text-2xl font-bold text-blue-700'>
                  {formatCurrency(totals.purchases)}
                </p>
              </div>
              <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
                <p className='text-sm text-green-600 font-medium'>
                  Total Sales
                </p>
                <p className='text-2xl font-bold text-green-700'>
                  {formatCurrency(totals.sales)}
                </p>
              </div>
              <div className='bg-amber-50 rounded-xl p-4 border border-amber-100'>
                <p className='text-sm text-amber-600 font-medium'>
                  Total Profit
                </p>
                <p className='text-2xl font-bold text-amber-700'>
                  {formatCurrency(totals.profit)}
                </p>
              </div>
              <div className='bg-red-50 rounded-xl p-4 border border-red-100'>
                <p className='text-sm text-red-600 font-medium'>
                  Total Expenses
                </p>
                <p className='text-2xl font-bold text-red-700'>
                  {formatCurrency(totals.expenses)}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className='h-[400px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#f0f0f0'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    tickFormatter={(date) => formatAxisDate(date, range)}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    interval={range === 'daily' ? 4 : 0}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 20 }}
                    iconType='circle'
                    formatter={(value) => (
                      <span className='text-sm font-medium text-gray-700'>
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type='monotone'
                    dataKey='purchases'
                    name='Purchases'
                    stroke='#3b82f6'
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                  <Line
                    type='monotone'
                    dataKey='sales'
                    name='Sales'
                    stroke='#10b981'
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                  <Line
                    type='monotone'
                    dataKey='profit'
                    name='Profit'
                    stroke='#f59e0b'
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                  <Line
                    type='monotone'
                    dataKey='expenses'
                    name='Expenses'
                    stroke='#ef4444'
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
