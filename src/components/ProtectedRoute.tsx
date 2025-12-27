import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role if on root path
  if (location.pathname === '/') {
    if (user?.role === 'Administrator') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/member" replace />;
    }
  }

  return <>{children}</>;
}