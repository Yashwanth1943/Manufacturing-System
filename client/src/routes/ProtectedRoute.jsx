import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth.js';

const roleHome = {
  admin: '/admin',
  production: '/production',
  defects: '/defects',
  quality: '/quality',
};

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="route-loading">Loading secure workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
