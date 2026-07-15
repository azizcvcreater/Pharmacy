// src/pages/Reports/SalesReport.jsx
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FiDownload, 
  FiRefreshCw, 
  FiCalendar,
  FiFileText,
  FiPrinter,
  FiDollarSign,
  FiShoppingCart,
  FiUser,
  FiPackage
} from 'react-icons/fi';
import api from '../../api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../components/common/ToastContainer';

const SalesReport = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_amount: 0,
    total_paid: 0,
    total_balance: 0,
    total_doctor_fees: 0,
    prescription_count: 0,
    non_prescription_count: 0,
  });
  
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    sale_type: '',
    payment_status: '',
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('start_date', filters.start_date);
      params.append('end_date', filters.end_date);
      if (filters.sale_type) params.append('type', filters.sale_type);
      if (filters.payment_status) params.append('status', filters.payment_status);
      params.append('limit', 1000);
      
      const response = await api.get(`/sales?${params.toString()}`);
      const data = response.data.data || response.data || [];
      
      setSales(data);
      
      const totalAmount = data.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
      const totalPaid = data.reduce((sum, s) => sum + parseFloat(s.paid_amount || 0), 0);
      const totalBalance = data.reduce((sum, s) => sum + parseFloat(s.balance_due || 0), 0);
      const doctorFees = data.reduce((sum, s) => sum + parseFloat(s.doctor_fees || 0), 0);
      const prescriptionCount = data.filter(s => s.sale_type === 'prescription').length;
      const nonPrescriptionCount = data.filter(s => s.sale_type === 'non_prescription').length;
      
      setSummary({
        total_sales: data.length,
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_balance: totalBalance,
        total_doctor_fees: doctorFees,
        prescription_count: prescriptionCount,
        non_prescription_count: nonPrescriptionCount,
      });
      
    } catch (error) {
      console.error('Error fetching sales report:', error);
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
    if (sales.length === 0) {
      showToast(t('common.noData'), 'warning');
      return;
    }

    try {
      const excelData = sales.map(s => ({
        'Invoice': s.invoice_number,
        'Date': new Date(s.sale_date).toLocaleDateString(),
        'Type': s.sale_type === 'prescription' ? t('reports.prescription') : t('reports.otc'),
        'Patient': s.patient_name || 'N/A',
        'Doctor': s.doctor_name || 'N/A',
        'Doctor Fees': parseFloat(s.doctor_fees || 0).toFixed(2),
        'Subtotal': parseFloat(s.subtotal || 0).toFixed(2),
        'Discount': parseFloat(s.discount || 0).toFixed(2),
        'Tax': parseFloat(s.tax || 0).toFixed(2),
        'Total': parseFloat(s.total || 0).toFixed(2),
        'Paid': parseFloat(s.paid_amount || 0).toFixed(2),
        'Balance': parseFloat(s.balance_due || 0).toFixed(2),
        'Status': s.payment_status || 'unpaid',
        'Notes': s.notes || ''
      }));

      const wb = XLSX.utils.book_new();
      
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
        { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Sales');

      const summaryData = [
        [t('reports.salesReport')],
        [''],
        [`${t('reports.fromDate')}: ${filters.start_date} ${t('common.to')} ${filters.end_date}`],
        [''],
        [t('common.metric') || 'Metric', t('common.value') || 'Value'],
        [t('sales.statistics.totalSales'), summary.total_sales],
        [t('sales.statistics.totalSales'), `$${summary.total_amount.toFixed(2)}`],
        [t('sales.statistics.totalPaid'), `$${summary.total_paid.toFixed(2)}`],
        [t('sales.statistics.totalBalance'), `$${summary.total_balance.toFixed(2)}`],
        [t('sales.statistics.doctorFees'), `$${summary.total_doctor_fees.toFixed(2)}`],
        [t('reports.prescription'), summary.prescription_count],
        [t('reports.otc'), summary.non_prescription_count],
        [''],
        [`${t('common.generatedOn') || 'Generated On'}: ${new Date().toLocaleString()}`],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [
        { wch: 20 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const fileName = `sales_report_${filters.start_date}_to_${filters.end_date}.xlsx`;
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

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { bg: 'bg-green-100 text-green-800', label: t('common.paid') },
      partial: { bg: 'bg-yellow-100 text-yellow-800', label: t('common.partial') },
      unpaid: { bg: 'bg-red-100 text-red-800', label: t('common.unpaid') },
    };
    const { bg, label } = statusMap[status] || statusMap.unpaid;
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bg}`}>{label}</span>;
  };

  const columns = [
    {
      header: t('sales.table.invoice'),
      key: 'invoice_number',
      render: (item) => <span className="font-medium text-green-600">{item.invoice_number}</span>
    },
    {
      header: t('sales.table.date'),
      key: 'sale_date',
      render: (item) => new Date(item.sale_date).toLocaleDateString()
    },
    {
      header: t('sales.table.type'),
      key: 'sale_type',
      render: (item) => (
        <span className={`px-2 py-0.5 text-xs rounded-full ${item.sale_type === 'prescription' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {item.sale_type === 'prescription' ? t('reports.prescription') : t('reports.otc')}
        </span>
      )
    },
    {
      header: t('sales.fields.patientName'),
      key: 'patient_name',
      render: (item) => item.patient_name || '—'
    },
    {
      header: t('sales.fields.doctorName'),
      key: 'doctor_name',
      render: (item) => item.doctor_name || '—'
    },
    {
      header: t('sales.table.total'),
      key: 'total',
      render: (item) => <span className="font-bold text-gray-800">{formatCurrency(item.total)}</span>
    },
    {
      header: t('sales.table.paid'),
      key: 'paid_amount',
      render: (item) => <span className="text-green-600">{formatCurrency(item.paid_amount)}</span>
    },
    {
      header: t('sales.table.balance'),
      key: 'balance_due',
      render: (item) => <span className={`font-semibold ${parseFloat(item.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(item.balance_due)}</span>
    },
    {
      header: t('sales.table.status'),
      key: 'payment_status',
      render: (item) => getStatusBadge(item.payment_status)
    },
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
            <FiFileText className="text-green-600" />
            {t('reports.salesReport')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('reports.salesSubtitle')}</p>
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
          >
            {t('reports.export')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.fromDate')} *</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.toDate')} *</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.saleType')}</label>
            <select
              name="sale_type"
              value={filters.sale_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t('reports.allTypes')}</option>
              <option value="prescription">{t('reports.prescription')}</option>
              <option value="non_prescription">{t('reports.otc')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.paymentStatus')}</label>
            <select
              name="payment_status"
              value={filters.payment_status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t('reports.allStatus')}</option>
              <option value="paid">{t('common.paid')}</option>
              <option value="partial">{t('common.partial')}</option>
              <option value="unpaid">{t('common.unpaid')}</option>
            </select>
          </div>
        </div>
      </div>

      {!loading && sales.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.totalSales')}</p>
            <p className="text-xl font-bold text-gray-800">{summary.total_sales}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.totalSales')}</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.total_amount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.totalPaid')}</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.total_paid)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.totalBalance')}</p>
            <p className={`text-xl font-bold ${summary.total_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(summary.total_balance)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.doctorFees')}</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.total_doctor_fees)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.statistics.prescriptions')}</p>
            <p className="text-xl font-bold text-purple-600">{summary.prescription_count}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500">{t('sales.fields.nonPrescription')}</p>
            <p className="text-xl font-bold text-blue-600">{summary.non_prescription_count}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={sales}
          emptyMessage={
            filters.start_date && filters.end_date
              ? `${t('common.noData')} ${filters.start_date} ${t('common.to')} ${filters.end_date}`
              : t('common.noData')
          }
        />
        {sales.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {t('reports.showing')} {sales.length} {t('reports.salesFound')}
            </span>
            <span className="text-sm font-medium">
              {t('common.total')}: {formatCurrency(summary.total_amount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;