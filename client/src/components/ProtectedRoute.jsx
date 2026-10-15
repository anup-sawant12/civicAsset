import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component:
 * 1. Checks if auth state is loading -> shows loader
 * 2. If not authenticated -> redirects to /login preserving current location
 * 3. If allowedRoles specified and user role not included -> redirects to /unauthorized
 * 4. Otherwise renders children
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
