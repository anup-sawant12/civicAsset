import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import OfficerHeader from '../../components/officer/OfficerHeader';
import { ClipboardList, Wrench, UserPlus, CheckSquare, CheckCircle, Layers, MapPin } from 'lucide-react';

export function OfficerDashboard() {
  const { user } = useAuth();

  const officerModules = [
    { title: 'Municipal Assets Registry', desc: 'Inspect infrastructure condition, maintenance dates & risk scores', icon: Layers, link: '/admin/assets' },
    { title: 'GIS Infrastructure Map', desc: 'Spatial asset distribution, OpenStreetMap pins, live filters and alerts', icon: MapPin, link: '/admin/map' },
    { title: 'Department Complaints', desc: 'Review, triage and accept inbound citizen reports', icon: ClipboardList, link: '/officer/complaints' },
    { title: 'Work Orders Dispatch', desc: 'Generate and schedule maintenance work orders', icon: Wrench, link: '/officer/work-orders' },
    { title: 'Worker Assignment', desc: 'Assign field workers and monitor task queue', icon: UserPlus, link: '/officer/work-orders' },
    { title: 'Repair Verification', desc: 'Inspect completion evidence & approve resolution', icon: CheckSquare, link: '/officer/work-orders' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <OfficerHeader activePage="overview" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Officer Credentials Authenticated
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Department Operations Console</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Manage department complaints, dispatch field personnel, track work orders, and review before/after repair evidence.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Department</span>
                <span className="text-sm font-bold text-blue-400">
                  {user?.departmentId ? `Dept: ${user.departmentId}` : 'Assigned Dept'}
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Role</span>
                <span className="text-sm font-bold text-blue-400">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4">Officer Action Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officerModules.map((item, idx) => {
              const Icon = item.icon;
              const cardContent = (
                <div
                  className={`p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between h-full ${
                    item.link
                      ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 cursor-pointer shadow-md'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Authority</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                      {item.link ? 'View Registry' : 'Review & Approve'}
                    </span>
                  </div>
                </div>
              );

              return item.link ? (
                <Link key={idx} to={item.link} className="block">
                  {cardContent}
                </Link>
              ) : (
                <div key={idx}>{cardContent}</div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OfficerDashboard;
