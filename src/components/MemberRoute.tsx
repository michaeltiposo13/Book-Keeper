import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MemberRouteProps {
  children: React.ReactNode;
}

export function MemberRoute({ children }: MemberRouteProps) {
  const { user } = useAuth();

  // Only Member role can access member routes
  if (user?.role !== 'Member') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
