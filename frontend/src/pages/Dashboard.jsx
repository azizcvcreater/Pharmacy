// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from '../hooks/useTranslation';
import Button from "../components/common/Button";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { 
  FiUsers, FiUser, FiTruck, FiDollarSign, FiShoppingCart,
  FiPackage, FiTrendingUp, FiTrendingDown, FiCalendar,
  FiClock, FiAlertCircle, FiCheckCircle, FiBarChart2
} from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    medicines: 0,
    suppliers: 0,
    payments: 0,
    purchases: 0,
    sales: 0,
    users: 0,
    staff: 0,
    total_credit: 0,
    total_debit: 0,
    total_sales_amount: 0,
    total_purchases_amount: 0,
    total_balance: 0,
    near_expiry: 0,
    expired: 0,
    out_of_stock: 0,
    low_stock: 0,
    today_sales: 0,
    today_sales_amount: 0,
    weekly_sales: 0,
    weekly_sales_amount: 0,
    monthly_sales: 0,
    monthly_sales_amount: 0,
    total_profit: 0,
    total_expenses: 0,
    net_profit: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/me");
      setUser(res.data);
      localStorage.setItem("userRole", res.data.role);
      await fetchAllStats(res.data);
      await fetchRecentData();
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStats = async (currentUser) => {
    try {
      // Medicines (includes expiry_stats)
      const medRes = await API.get("/medicines?limit=1").catch(() => ({ data: {} }));
      const expiryStats = medRes.data?.expiry_stats || { expired: 0, near_expiry: 0 };

      // Suppliers (now with total_purchases and total_paid)
      const supRes = await API.get("/suppliers?limit=100").catch(() => ({ data: { data: [] } }));
      const suppliers = supRes.data?.data || [];

      // Supplier payments count
      const payRes = await API.get("/supplier-payments?limit=1").catch(() => ({ data: { total: 0 } }));
      const payments = payRes.data?.total || 0;

      // Purchases
      const purRes = await API.get("/purchases?limit=100").catch(() => ({ data: { data: [] } }));
      const purchases = purRes.data?.data || [];

      // Sales
      const saleRes = await API.get("/sales?limit=100").catch(() => ({ data: { data: [] } }));
      const sales = saleRes.data?.data || [];

      // Users
      const userRes = await API.get("/users").catch(() => ({ data: [] }));
      const users = userRes.data || [];

      // Profit summary
      const profitRes = await API.get("/profit/summary?period=monthly").catch(() => ({ data: {} }));
      const profitData = profitRes.data || {};

      // Stock summary
      const stockRes = await API.get("/medicines/stock-summary").catch(() => ({ data: {} }));
      const stockStats = stockRes.data || {};

      // Calculate credit/debit from suppliers
      let totalCredit = 0;
      let totalDebit = 0;
      suppliers.forEach(supplier => {
        const totalPurchases = supplier.total_purchases || 0;
        const totalPaid = supplier.total_paid || 0;
        const balance = totalPurchases - totalPaid;
        if (balance > 0) totalCredit += balance;
        else if (balance < 0) totalDebit += Math.abs(balance);
      });

      // Sales totals
      const totalSalesAmount = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
      const totalPurchasesAmount = purchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
      const totalBalance = totalSalesAmount - totalPurchasesAmount;

      // Date-based sales
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(s => s.sale_date === today);
      const todaySalesAmount = todaySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklySales = sales.filter(s => new Date(s.sale_date) >= weekAgo);
      const weeklySalesAmount = weeklySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthlySales = sales.filter(s => new Date(s.sale_date) >= monthAgo);
      const monthlySalesAmount = monthlySales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

      // Staff count
      const staffCount = users.filter(u => {
        if (currentUser?.role === 'admin') {
          return u.role === 'staff' && u.admin_id === currentUser.id;
        }
        return false;
      }).length;

      setStats({
        medicines: medRes.data?.total || 0,
        suppliers: supRes.data?.total || suppliers.length || 0,
        payments: payments,
        purchases: purchases.length || 0,
        sales: sales.length || 0,
        users: users.length,
        staff: staffCount,
        total_credit: totalCredit,
        total_debit: totalDebit,
        total_sales_amount: totalSalesAmount,
        total_purchases_amount: totalPurchasesAmount,
        total_balance: totalBalance,
        near_expiry: expiryStats.near_expiry || 0,
        expired: expiryStats.expired || 0,
        out_of_stock: stockStats.out_of_stock_count || 0,
        low_stock: stockStats.low_stock_count || 0,
        today_sales: todaySales.length,
        today_sales_amount: todaySalesAmount,
        weekly_sales: weeklySales.length,
        weekly_sales_amount: weeklySalesAmount,
        monthly_sales: monthlySales.length,
        monthly_sales_amount: monthlySalesAmount,
        total_profit: profitData.profit?.gross_profit || 0,
        total_expenses: profitData.profit?.total_expenses || 0,
        net_profit: profitData.profit?.net_profit || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentData = async () => {
    try {
      const saleRes = await API.get("/sales?limit=5");
      const sales = saleRes.data?.data || [];
      const purRes = await API.get("/purchases?limit=5");
      const purchases = purRes.data?.data || [];

      const activities = [];
      
      sales.forEach(sale => {
        activities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: `${t('sales.title')} ${sale.invoice_number}`,
          amount: sale.total,
          date: sale.sale_date,
          status: sale.payment_status,
          icon: <FiShoppingCart className="text-green-600" />,
          color: 'bg-green-100'
        });
      });

      purchases.forEach(purchase => {
        activities.push({
          id: `purchase-${purchase.id}`,
          type: 'purchase',
          title: `${t('purchases.title')} ${purchase.invoice_number}`,
          amount: purchase.total,
          date: purchase.purchase_date,
          status: purchase.payment_status,
          icon: <FiPackage className="text-blue-600" />,
          color: 'bg-blue-100'
        });
      });

      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('dashboard.welcome', { name: user?.name })}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar className="text-gray-400" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalSales')}
          value={formatCurrency(stats.total_sales_amount)}
          icon={<FiShoppingCart className="text-2xl" />}
          color="green"
          subtitle={`${stats.sales} ${t('dashboard.transactions')}`}
        />
        <StatCard
          title={t('dashboard.totalPurchases')}
          value={formatCurrency(stats.total_purchases_amount)}
          icon={<FiPackage className="text-2xl" />}
          color="blue"
          subtitle={`${stats.purchases} ${t('dashboard.purchases')}`}
        />
        <StatCard
          title={t('dashboard.grossProfit')}
          value={formatCurrency(stats.total_profit)}
          icon={<FiTrendingUp className="text-2xl" />}
          color="indigo"
          subtitle={`${t('dashboard.netProfit')}: ${formatCurrency(stats.net_profit)}`}
        />
        <StatCard
          title={t('dashboard.totalExpenses')}
          value={formatCurrency(stats.total_expenses)}
          icon={<FiDollarSign className="text-2xl" />}
          color="red"
          subtitle={`${stats.payments} ${t('dashboard.payments')}`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.medicines')}</p>
          <p className="text-xl font-bold text-gray-800">{stats.medicines}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.suppliers')}</p>
          <p className="text-xl font-bold text-gray-800">{stats.suppliers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.users')}</p>
          <p className="text-xl font-bold text-gray-800">{stats.users}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.staff')}</p>
          <p className="text-xl font-bold text-gray-800">{stats.staff}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.outOfStock')}</p>
          <p className={`text-xl font-bold ${stats.out_of_stock > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.out_of_stock}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 text-center">
          <p className="text-xs text-gray-500">{t('dashboard.lowStock')}</p>
          <p className={`text-xl font-bold ${stats.low_stock > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {stats.low_stock}
          </p>
        </div>
      </div>

      {(stats.expired > 0 || stats.near_expiry > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.expired > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
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
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.todaySales')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.today_sales}</p>
              <p className="text-sm text-green-600 font-medium">{formatCurrency(stats.today_sales_amount)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.weeklySales')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.weekly_sales}</p>
              <p className="text-sm text-blue-600 font-medium">{formatCurrency(stats.weekly_sales_amount)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiBarChart2 size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.monthlySales')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.monthly_sales}</p>
              <p className="text-sm text-purple-600 font-medium">{formatCurrency(stats.monthly_sales_amount)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <FiCalendar size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={t('dashboard.totalCredit')}
          value={formatCurrency(stats.total_credit)}
          icon="🔴"
          color="red"
          subtitle={t('dashboard.totalCreditSubtitle')}
        />
        <StatCard
          title={t('dashboard.totalDebit')}
          value={formatCurrency(stats.total_debit)}
          icon="🟢"
          color="green"
          subtitle={t('dashboard.totalDebitSubtitle')}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiClock className="text-gray-400" />
            {t('dashboard.recentActivities')}
          </h3>
          <span className="text-xs text-gray-400">{recentActivities.length} {t('common.records')}</span>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {t('dashboard.noActivities')}
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{formatCurrency(activity.amount)}</p>
                  {activity.status && getStatusBadge(activity.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {user?.role === "admin" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.quickActions')}</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/create-staff")}
              icon={<FiUser size={18} />}
              size="sm"
            >
              {t('dashboard.addStaff')}
            </Button>
            <Button
              onClick={() => navigate("/medicines")}
              icon={<FaPills size={18} />}
              variant="success"
              size="sm"
            >
              {t('dashboard.addMedicine')}
            </Button>
            <Button
              onClick={() => navigate("/suppliers")}
              icon={<FiTruck size={18} />}
              variant="outline"
              size="sm"
            >
              {t('dashboard.addSupplier')}
            </Button>
            <Button
              onClick={() => navigate("/sales")}
              icon={<FiShoppingCart size={18} />}
              variant="warning"
              size="sm"
            >
              {t('dashboard.newSale')}
            </Button>
            <Button
              onClick={() => navigate("/purchases")}
              icon={<FiPackage size={18} />}
              variant="secondary"
              size="sm"
            >
              {t('dashboard.newPurchase')}
            </Button>
            <Button
              onClick={() => navigate("/payments")}
              icon={<FiDollarSign size={18} />}
              variant="danger"
              size="sm"
            >
              {t('dashboard.recordPayment')}
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              icon={<FiBarChart2 size={18} />}
              variant="primary"
              size="sm"
            >
              {t('dashboard.viewReports')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}