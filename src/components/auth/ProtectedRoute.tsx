import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type UserType = 'EV_DRIVER' | 'STATION_OPERATOR' | 'ADMIN';

interface ProtectedRouteProps {
  readonly children: React.ReactNode | ((props: { userType: UserType | null }) => React.ReactNode);
  readonly allowedUserTypes?: UserType[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If no specific user types are required, allow access
  if (!allowedUserTypes) {
    if (typeof children === 'function') {
      return <>{children({ userType: user?.userType as UserType })}</>;
    }
    return <>{children}</>;
  }

  // Check if user's type is allowed
  if (!user || !allowedUserTypes.includes(user.userType as UserType)) {
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

  if (typeof children === 'function') {
    return <>{children({ userType: user.userType as UserType })}</>;
  }
  return <>{children}</>;
} 