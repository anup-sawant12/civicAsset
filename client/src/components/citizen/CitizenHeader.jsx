import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, FileText, PlusCircle, LayoutDashboard, LogOut } from 'lucide-react';

export function CitizenHeader({ activePage }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Overview', path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'My Complaints', path: '/citizen/complaints', icon: FileText },
    { label: 'Report Issue', path: '/citizen/complaints/new', icon: PlusCircle },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/citizen/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base tracking-tight hidden sm:inline">CIVICASSET</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              CITIZEN
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || activePage === item.label.toLowerCase();
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[10px] text-slate-400">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default CitizenHeader;
