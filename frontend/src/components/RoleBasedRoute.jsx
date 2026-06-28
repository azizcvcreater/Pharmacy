// src/components/RoleBasedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Optional: fallback route per role
const getDefaultRoute = (role) => {
  switch (role) {
    case 'super_admin':
      return '/pharmacy';
    case 'admin':
      return '/';
    case 'staff':
      return '/medicine';
    default:
      return '/login';
  }
};

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // If user role is not in allowedRoles, redirect
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const fallback = getDefaultRoute(user?.role);
    return <Navigate to={fallback} replace />;
  }

  return children;
}
