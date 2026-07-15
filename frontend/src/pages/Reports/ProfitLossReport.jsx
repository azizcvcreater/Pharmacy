// src/pages/Reports/ProfitLossReport.jsx
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiFileText
} from 'react-icons/fi';
import api from '../../api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/ToastContainer';

const ProfitLossReport = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/profit/summary?period=custom&start_date=${filters.start_date}&end_date=${filters.end_date}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching profit report:', error);
      showToast(t('errors.generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const exportExcel = () => {
    if (!reportData) {
      showToast(t('common.noData'), 'warning');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['Profit & Loss Report'],
        [''],
        ['Period', `${filters.start_date} to ${filters.end_date}`],
        [''],
        ['Metric', 'Amount'],
        ['Total Sales', reportData.sales?.total || 0],
        ['Total Purchases', reportData.purchases?.total || 0],
        ['Gross Profit', reportData.profit?.gross_profit || 0],
        ['Total Expenses', reportData.profit?.total_expenses || 0],
        ['Net Profit', reportData.profit?.net_profit || 0],
        [''],
        ['Additional Metrics', ''],
        ['Total Sales Count', reportData.sales?.count || 0],
        ['Total Purchases Count', reportData.purchases?.count || 0],
        ['Expenses Count', reportData.profit?.expenses_count || 0],
        [''],
        ['Generated On', new Date().toLocaleString()],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [
        { wch: 25 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      if (reportData.profit?.expenses_by_category && Object.keys(reportData.profit.expenses_by_category).length > 0) {
        const expensesData = Object.entries(reportData.profit.expenses_by_category).map(([category, amount]) => ({
          'Category': category.charAt(0).toUpperCase() + category.slice(1),
          'Amount': amount,
        }));

        const totalExpenses = Object.values(reportData.profit.expenses_by_category).reduce((a, b) => a + b, 0);
        expensesData.push({
          'Category': 'TOTAL',
          'Amount': totalExpenses,
        });

        const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
        wsExpenses['!cols'] = [
          { wch: 25 },
          { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses by Category');
      }

      const fileName = `profit_loss_${filters.start_date}_to_${filters.end_date}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      showToast(t('success.updated'), 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast(t('errors.generic'), 'error');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
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
            <FiTrendingUp className="text-indigo-600" />
            {t('reports.title')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchReport}
            variant="secondary"
            icon={<FiRefreshCw size={18} />}
          >
            {t('reports.refresh')}
          </Button>
          <Button
            onClick={exportExcel}
            variant="success"
            icon={<FiDownload size={18} />}
            disabled={!reportData}
          >
            {t('reports.export')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('reports.fromDate')}
            name="start_date"
            type="date"
            value={filters.start_date}
            onChange={handleFilterChange}
            required
            className="!mb-0"
          />
          <Input
            label={t('reports.toDate')}
            name="end_date"
            type="date"
            value={filters.end_date}
            onChange={handleFilterChange}
            required
            className="!mb-0"
          />
        </div>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.totalSales')}</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.sales?.total)}</p>
                  <p className="text-xs text-gray-400 mt-1">{reportData.sales?.count || 0} {t('reports.transactions')}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FiShoppingCart size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.expenses')}</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.profit?.total_expenses)}</p>
                  <p className="text-xs text-gray-400 mt-1">{reportData.profit?.expenses_count || 0} {t('reports.expensesCount')}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <FiDollarSign size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.netProfit')}</p>
                  <p className={`text-2xl font-bold ${parseFloat(reportData.profit?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData.profit?.net_profit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('reports.afterExpenses')}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${parseFloat(reportData.profit?.net_profit || 0) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {parseFloat(reportData.profit?.net_profit || 0) >= 0 ? <FiTrendingUp size={24} /> : <FiTrendingDown size={24} />}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reports.revenueBreakdown')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('reports.totalSales')}</span>
                  <span className="font-bold text-gray-800">{formatCurrency(reportData.sales?.total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('reports.totalPurchases')}</span>
                  <span className="font-bold text-red-600">{formatCurrency(reportData.purchases?.total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('reports.grossProfit')}</span>
                  <span className="font-bold text-green-600">{formatCurrency(reportData.profit?.gross_profit)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('reports.expenses')}</span>
                  <span className="font-bold text-red-600">{formatCurrency(reportData.profit?.total_expenses)}</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-gray-300">
                  <span className="text-lg font-semibold text-gray-800">{t('reports.netProfit')}</span>
                  <span className={`text-lg font-bold ${parseFloat(reportData.profit?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData.profit?.net_profit)}
                  </span>
                </div>
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
                      marketing: t('expenses.categories.marketing'),
                      transport: t('expenses.categories.transport'),
                      insurance: t('expenses.categories.insurance'),
                      tax: t('expenses.categories.tax'),
                      other: t('expenses.categories.other'),
                    };
                    
                    const categoryColors = {
                      purchase: 'bg-blue-500',
                      utility: 'bg-yellow-500',
                      rent: 'bg-purple-500',
                      salary: 'bg-green-500',
                      maintenance: 'bg-orange-500',
                      marketing: 'bg-pink-500',
                      transport: 'bg-indigo-500',
                      insurance: 'bg-teal-500',
                      tax: 'bg-red-500',
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

export default ProfitLossReport;