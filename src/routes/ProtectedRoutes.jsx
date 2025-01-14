import { Navigate, useLocation } from 'react-router-dom';
import { ROLES, ROUTES } from '../constants/roles';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('user_role') || ROLES.PUBLIC;
  const isPublicRoute = ROUTES.PUBLIC.some(route => location.pathname.includes(route));

  // Allow public routes for everyone
  if (isPublicRoute) {
    return children;
  }

  // Check for admin routes
  if (requiredRole === ROLES.ADMIN && userRole !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  // Check for user routes
  if (requiredRole === ROLES.USER && userRole === ROLES.PUBLIC) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;