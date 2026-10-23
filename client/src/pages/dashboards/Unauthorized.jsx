import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRoleDashboardPath } from '../../utils/authUtils';
import ThemeToggle from '../../components/common/ThemeToggle';

export function Unauthorized() {
  const { user } = useAuth();
  const returnPath = getRoleDashboardPath(user?.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle showLabel={true} />
      </div>
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-sm text-slate-400 mt-2">
            Your authenticated role (<span className="text-rose-400 font-semibold">{user?.role || 'Guest'}</span>) does not have authorization to view this section of CivicAsset.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to={returnPath}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Your Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
