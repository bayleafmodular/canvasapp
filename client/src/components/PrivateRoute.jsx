import { Navigate } from 'react-router-dom';

const getPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem('permissions') || '{}');
  } catch {
    return {};
  }
};

const PrivateRoute = ({ children, allowedRoles, requiredPermission }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const permissions = getPermissions();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  if (role !== 'admin' && requiredPermission && !permissions[requiredPermission]) {
    return <Navigate to="/staff-dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
