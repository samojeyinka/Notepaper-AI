import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any route that requires authentication.
 * If the user has no token in memory, redirects to /signin.
 * Stores the intended path so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Wrap any route that MUST NOT be accessible if the user is logged in.
 * (e.g. Sign In, Sign Up, Forgot Password)
 * Redirects to /lockedin if authenticated.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/lockedin" replace />;
  }

  return children;
}
