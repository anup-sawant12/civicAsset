import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import WorkerHeader from '../../components/worker/WorkerHeader';
import { Wrench, RefreshCw, CheckCircle2, CheckCircle, Layers, MapPin } from 'lucide-react';

export function WorkerDashboard() {
  const { user } = useAuth();

  const workerModules = [
    { title: 'Municipal Assets Registry', desc: 'Look up asset coordinates, type & condition for assigned repairs', icon: Layers, link: '/admin/assets' },
    { title: 'GIS Asset Map', desc: 'Geographic map of municipal infrastructure and repair coordinates', icon: MapPin, link: '/admin/map' },
    { title: 'Assigned Work Orders', desc: 'Active tasks, SLA deadlines and repair locations', icon: Wrench, link: '/worker/work-orders' },
    { title: 'Repair Updates', desc: 'Log on-site repair notes and status transitions', icon: RefreshCw, link: '/worker/work-orders' },
    { title: 'Completion Workflow', desc: 'Upload after-repair photos & request inspection', icon: CheckCircle2, link: '/worker/work-orders' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <WorkerHeader activePage="overview" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Field Personnel Verified
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Field Operations Center</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                View your assigned work orders, navigate to municipal asset coordinates, update progress notes, and submit photographic proof of completed repairs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Worker Role</span>
                <span className="text-sm font-bold text-amber-400">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4">Field Worker Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workerModules.map((item, idx) => {
              const Icon = item.icon;
              const CardContent = (
                <div
                  className={`p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-150 flex flex-col justify-between h-full ${
                    item.link ? 'hover:border-amber-500/50 cursor-pointer group' : ''
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{item.link ? 'Registry' : 'Action'}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                      {item.link ? 'View Assets →' : 'Execute Task'}
                    </span>
                  </div>
                </div>
              );

              return item.link ? (
                <Link key={idx} to={item.link}>
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

export default WorkerDashboard;
