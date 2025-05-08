import { Navigate, useLocation } from 'react-router-dom';
import { ROLES, ROUTES } from '../constants/roles';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('user_role') || ROLES.PUBLIC;
  const isPublicRoute = ROUTES.PUBLIC.some(route => location.pathname.includes(route));
  console.log(userRole);

  // Allow public routes for everyone
  if (isPublicRoute) {
    return children;
  }

  // Si el usuario es admin, permitir acceso a todas las rutas
  if (userRole === ROLES.ADMIN) {
    return children;
  }

  // Si requiredRole es un array, verificar si el rol del usuario está incluido
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(userRole)) {
      return <Navigate to={`/`} replace />;
    }
  } else {
    if (requiredRole === ROLES.USER && userRole === ROLES.PUBLIC) {
      return <Navigate to={`/login`} replace />;
    }
    // Si requiredRole es un solo rol, verificar que coincida
    if (requiredRole !== userRole) {
      return <Navigate to={`/`} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;