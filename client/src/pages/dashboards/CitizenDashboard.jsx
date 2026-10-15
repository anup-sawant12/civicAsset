import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, AlertTriangle, FileText, SearchCheck, LogOut, CheckCircle } from 'lucide-react';

export function CitizenDashboard() {
  const { user, logout } = useAuth();

  const citizenModules = [
    { title: 'Report Issue / Complaint', desc: 'Report an infrastructure issue with GPS location & photo evidence', icon: AlertTriangle, link: '/citizen/complaints/new', action: 'Report Now →' },
    { title: 'My Complaints', desc: 'View history of civic reports and ongoing resolution timelines', icon: FileText, link: '/citizen/complaints', action: 'View My Reports →' },
    { title: 'Complaint Tracking', desc: 'Live timeline status from municipal assignment to repair verification', icon: SearchCheck, link: '/citizen/complaints', action: 'Track Issues →' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">CIVICASSET</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CITIZEN PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Citizen Account Active
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}!</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Participate in municipal governance. Search the city asset map, submit complaints about broken infrastructure, and track real-time resolution from municipal officers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Account Role</span>
                <span className="text-sm font-bold text-emerald-400">{user?.role}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Account Status</span>
                <span className="text-sm font-bold text-emerald-400">{user?.status || 'ACTIVE'}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4">Citizen Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {citizenModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.link}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Service</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                      {item.action}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CitizenDashboard;
