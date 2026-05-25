// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StockIndex from './pages/medicines/StockIndex';
import ItemsCreate from './pages/items/ItemsCreate';
import Purchase from './pages/purchases/Purchase';
import Sale from './pages/sales/Sale';
import ExpensesPage from './pages/expenses/Expenses';
import TransactionList from './pages/TransactionList';
import Doctor from './pages/doctor/Doctor';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import User from './pages/users/User'; // Keep for profile management
import Suppliers from './pages/supplier/Suppliers';
import Payments from './pages/payment/Payments';
import SupplierLedger from './pages/supplier/SupplierLedger';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />

          {/* Protected routes – any authenticated user can access all */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard (index) */}
            <Route index element={<Dashboard />} />

            {/* Expenses */}
            <Route path='expense' element={<ExpensesPage />} />

            {/* Transactions */}
            <Route path='tran' element={<TransactionList />} />

            {/* Doctors */}
            <Route path='doc' element={<Doctor />} />

            {/* User profile */}
            <Route path='user' element={<User />} />

            {/* Medicines stock */}
            <Route path='medicine' element={<StockIndex />} />

            {/* Purchases */}
            <Route path='purchase' element={<Purchase />} />

            {/* Sales */}
            <Route path='sale' element={<Sale />} />

            {/* Medicine items (catalog) */}
            <Route path='items' element={<ItemsCreate />} />

            {/* Suppliers */}
            <Route path='suppliers' element={<Suppliers />} />

            {/* Payments */}
            <Route path='payments' element={<Payments />} />

            {/* Supplier Ledger */}
            <Route path='suppliers/:id/ledger' element={<SupplierLedger />} />
          </Route>

          {/* Catch‑all redirect */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
