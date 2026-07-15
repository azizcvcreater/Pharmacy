// src/pages/Reports.jsx
import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiCalendar,
  FiBarChart2,
  FiDownload,
  FiRefreshCw,
  FiPackage,
  FiShoppingCart,
  FiUsers
} from 'react-icons/fi';
import api from '../api';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

const Reports = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const periodOptions = [
    { value: 'today', label: t('dashboard.todaySales') },
    { value: 'weekly', label: t('dashboard.weeklySales') },
    { value: 'monthly', label: t('dashboard.monthlySales') },
    { value: 'yearly', label: t('reports.year') },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: (new Date().getFullYear() - i).toString()
  }));

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    fetchReport();
  }, [period, year, month]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      
      let url = `/profit/summary?period=${period}`;
      if (period === 'yearly') {
        url += `&year=${year}`;
      } else if (period === 'monthly') {
        url += `&year=${year}&month=${month}`;
      }
      
      const response = await api.get(url);
      setReportData(response.data);
      
      const chartResponse = await api.get(`/profit/report?period=${period}&year=${year}&month=${month}`);
      setChartData(chartResponse.data.data || []);
      
    } catch (error) {
      console.error('Error fetching report:', error);
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getProfitColor = (amount) => {
    const num = parseFloat(amount) || 0;
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

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
            <FiBarChart2 className="text-blue-600" />
            {t('reports.title')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchReport}
            variant="secondary"
            icon={<FiRefreshCw size={18} />}
            size="sm"
          >
            {t('reports.refresh')}
          </Button>
          <Button
            variant="outline"
            icon={<FiDownload size={18} />}
            size="sm"
          >
            {t('reports.export')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-40">
            <Select
              label={t('reports.period')}
              name="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={periodOptions}
              className="!mb-0"
            />
          </div>
          
          {period === 'yearly' && (
            <div className="w-40">
              <Select
                label={t('reports.year')}
                name="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                options={yearOptions}
                className="!mb-0"
              />
            </div>
          )}
          
          {period === 'monthly' && (
            <>
              <div className="w-40">
                <Select
                  label={t('reports.year')}
                  name="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  options={yearOptions}
                  className="!mb-0"
                />
              </div>
              <div className="w-40">
                <Select
                  label={t('reports.month')}
                  name="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  options={monthOptions}
                  className="!mb-0"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.totalSales')}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(reportData.sales?.total)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {reportData.sales?.count || 0} {t('reports.transactions')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FiShoppingCart size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.totalPurchases')}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(reportData.purchases?.total)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {reportData.purchases?.count || 0} {t('reports.purchasesCount')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <FiPackage size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.grossProfit')}</p>
                  <p className={`text-2xl font-bold ${getProfitColor(reportData.profit?.gross_profit)}`}>
                    {formatCurrency(reportData.profit?.gross_profit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('reports.beforeExpenses')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <FiTrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.netProfit')}</p>
                  <p className={`text-2xl font-bold ${getProfitColor(reportData.profit?.net_profit)}`}>
                    {formatCurrency(reportData.profit?.net_profit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {reportData.profit?.expenses_count || 0} {t('reports.expensesCount')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <FiDollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.periodBreakdown')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.date')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.totalSales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.grossProfit')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.expenses')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.netProfit')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {chartData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{item.label}</td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          {formatCurrency(item.sales_total)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${getProfitColor(item.gross_profit)}`}>
                          {formatCurrency(item.gross_profit)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(item.expenses)}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${getProfitColor(item.net_profit)}`}>
                          {formatCurrency(item.net_profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {chartData.length > 0 && (
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-gray-800">{t('common.total')}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatCurrency(chartData.reduce((sum, item) => sum + parseFloat(item.sales_total || 0), 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {formatCurrency(chartData.reduce((sum, item) => sum + parseFloat(item.gross_profit || 0), 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">
                          {formatCurrency(chartData.reduce((sum, item) => sum + parseFloat(item.expenses || 0), 0))}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${getProfitColor(chartData.reduce((sum, item) => sum + parseFloat(item.net_profit || 0), 0))}`}>
                          {formatCurrency(chartData.reduce((sum, item) => sum + parseFloat(item.net_profit || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
                {chartData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t('reports.noData')}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.expensesByCategory')}</h3>
              {reportData.profit?.expenses_by_category && 
               Object.keys(reportData.profit.expenses_by_category).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(reportData.profit.expenses_by_category).map(([category, amount]) => {
                    const totalExpenses = Object.values(reportData.profit.expenses_by_category).reduce((a, b) => a + b, 0);
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                    
                    const categoryLabels = {
                      purchase: t('expenses.categories.inventory'),
                      utility: t('expenses.categories.utilities'),
                      rent: t('expenses.categories.rent'),
                      salary: t('expenses.categories.salary'),
                      maintenance: t('expenses.categories.maintenance'),
                      other: t('expenses.categories.other'),
                    };
                    
                    const categoryColors = {
                      purchase: 'bg-blue-500',
                      utility: 'bg-yellow-500',
                      rent: 'bg-purple-500',
                      salary: 'bg-green-500',
                      maintenance: 'bg-orange-500',
                      other: 'bg-gray-500',
                    };
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{categoryLabels[category] || category}</span>
                          <span className="font-medium text-gray-800">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">{t('reports.totalExpenses') || 'Total Expenses'}</span>
                      <span className="text-red-600">{formatCurrency(reportData.profit.total_expenses)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;