import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If no specific user types are required, allow access
  if (!allowedUserTypes) {
    return <>{children}</>;
  }

  // Check if user's type is allowed
  if (!user || !allowedUserTypes.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type
    switch (user?.userType) {
      case 'EV_DRIVER':
        return <Navigate to="/evdriver" replace />;
      case 'STATION_OPERATOR':
        return <Navigate to="/operator" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
} 