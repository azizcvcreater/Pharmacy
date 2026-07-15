// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from "./components/common/ToastContainer";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateStaff from "./pages/CreateStaff";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Medicines from "./pages/Medicines";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Expiry from "./pages/Expiry";
import Expenses from "./pages/Expenses";
import SalesReport from "./pages/Reports/SalesReport";
import ProfitLossReport from "./pages/Reports/ProfitLossReport";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Users />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="create-staff"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CreateStaff />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="medicines"
                  element={
                    <ProtectedRoute>
                      <Medicines />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="expiry"
                  element={
                    <ProtectedRoute>
                      <Expiry />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="suppliers"
                  element={
                    <ProtectedRoute>
                      <Suppliers />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="purchases"
                  element={
                    <ProtectedRoute>
                      <Purchases />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="sales"
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="expenses"
                  element={
                    <ProtectedRoute>
                      <Expenses />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                
                {/* Report Routes */}
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="reports/sales"
                  element={
                    <ProtectedRoute>
                      <SalesReport />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="reports/profit-loss"
                  element={
                    <ProtectedRoute>
                      <ProfitLossReport />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </I18nextProvider>
  );
}

export default App;