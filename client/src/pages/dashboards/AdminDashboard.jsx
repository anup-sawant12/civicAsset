import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AdminHeader from '../../components/admin/AdminHeader';
import { Users, Building, Layers, AlertCircle, Wrench, FileText, CheckCircle, ArrowRight, MapPin } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  const adminModules = [
    {
      title: 'Users Management',
      desc: 'Provision officers, field technicians, citizens and adjust access statuses',
      icon: Users,
      link: '/admin/users',
      badge: 'Manage Personnel',
      active: true,
    },
    {
      title: 'Departments',
      desc: 'Configure municipal divisions, public works sectors and view asset metrics',
      icon: Building,
      link: '/admin/departments',
      badge: 'Configure Divisions',
      active: true,
    },
    {
      title: 'Municipal Assets',
      desc: 'Lifecycle inventory, risk scores, maintenance schedules and condition audits',
      icon: Layers,
      link: '/admin/assets',
      badge: 'Asset Registry',
      active: true,
    },
    {
      title: 'GIS & Spatial Map',
      desc: 'Interactive OpenStreetMap asset visualization, coordinate pins and filtering',
      icon: MapPin,
      link: '/admin/map',
      badge: 'Live GIS Map',
      active: true,
    },
    {
      title: 'Civic Complaints',
      desc: 'Public reports triage, geo-tagging, priority review and resolution workflows',
      icon: AlertCircle,
      link: '/admin/complaints',
      badge: 'Incident Hotline',
      active: true,
    },
    {
      title: 'Work Orders',
      desc: 'Maintenance and repair dispatch logs with field technician SLAs',
      icon: Wrench,
      badge: 'Upcoming',
      active: false,
    },
    {
      title: 'Audit Logs',
      desc: 'Tamper-proof system activity history and security tracking',
      icon: FileText,
      badge: 'System Log',
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="overview" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Authentication & Role Verification Active
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Administrator Control Center</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                You are authenticated as <span className="text-slate-200 font-semibold">{user?.firstName} {user?.lastName}</span> with administrative privileges. Manage municipal personnel, departmental divisions, and oversee civic operations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Current Role</span>
                <span className="text-sm font-bold text-rose-400">{user?.role}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Account Status</span>
                <span className="text-sm font-bold text-emerald-400">{user?.status || 'ACTIVE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-300">Authorized Administrative Modules</h2>
            <span className="text-xs text-slate-500">CivicAsset Municipal Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminModules.map((item, idx) => {
              const Icon = item.icon;
              const CardContent = (
                <div
                  className={`p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between h-full ${
                    item.active
                      ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 shadow-md group cursor-pointer'
                      : 'bg-slate-900/40 border-slate-850 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Access Status</span>
                    {item.active ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <span>Open Module</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Phase 2</span>
                    )}
                  </div>
                </div>
              );

              return item.link ? (
                <Link key={idx} to={item.link} className="block">
                  {CardContent}
                </Link>
              ) : (
                <div key={idx}>{CardContent}</div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
