import { Navigate, useLocation } from 'react-router-dom';
import { ROLES, ROUTES } from '../constants/roles';
import { decryptRole } from '@/lib/getRole';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const isPublicRoute = ROUTES.PUBLIC.some(route => location.pathname.includes(route));

  const userRole = localStorage.getItem('user_role') || ROLES.PUBLIC;

  const userRoleDecrypted = decryptRole(userRole);

  // Allow public routes for everyone
  if (isPublicRoute) {
    return children;
  }

  // Si el usuario es admin, permitir acceso a todas las rutas
  if (userRoleDecrypted === ROLES.ADMIN) {
    return children;
  }

  // Si requiredRole es un array, verificar si el rol del usuario está incluido
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(userRoleDecrypted)) {
      return <Navigate to={`/`} replace />;
    }
  } else {
    if (requiredRole === ROLES.USER && userRoleDecrypted === ROLES.PUBLIC) {
      return <Navigate to={`/login`} replace />;
    }
    // Si requiredRole es un solo rol, verificar que coincida
    if (requiredRole !== userRoleDecrypted) {
      return <Navigate to={`/`} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;