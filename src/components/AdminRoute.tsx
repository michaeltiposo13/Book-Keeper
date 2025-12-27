import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  // Only Administrator role can access admin routes
  if (user?.role !== 'Administrator') {
    return <Navigate to="/member" replace />;
  }

  return <>{children}</>;
}