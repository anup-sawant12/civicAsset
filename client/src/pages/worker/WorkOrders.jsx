import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import WorkerHeader from '../../components/worker/WorkerHeader';
import { WorkOrderStatusBadge, WorkOrderSlaBadge } from '../../components/workOrders/WorkOrderBadges';
import CompleteWorkModal from '../../components/workOrders/CompleteWorkModal';
import workOrderService from '../../services/workOrderService';
import {
  Wrench,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Calendar,
  Layers,
  ChevronRight,
  HardHat,
} from 'lucide-react';

export function WorkerWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, inProgress: 0, completed: 0, slaBreached: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Complete work modal state
  const [completeOrder, setCompleteOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await workOrderService.getWorkOrderStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workOrderService.getWorkOrders({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res.success) {
        setWorkOrders(res.data.workOrders || []);
      }
    } catch (err) {
      console.error('Failed to load worker work orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch assigned work orders.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleStartWork = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      const res = await workOrderService.startWork(id);
      if (res.success) {
        setWorkOrders((prev) =>
          prev.map((wo) => (wo.id === id ? { ...wo, ...res.data } : wo))
        );
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleWorkCompleted = (updated) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === updated.id ? { ...wo, ...updated } : wo))
    );
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <WorkerHeader activePage="my work orders" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <HardHat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Field Operations Center
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Assigned Work Orders</h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time dispatch queue, on-site navigation, and task resolution tracking.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchOrders();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tasks</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Assigned</span>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Ready to Start</span>
            <span className="text-2xl font-bold text-amber-400">{stats.assigned}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Active Work</span>
            <span className="text-2xl font-bold text-cyan-400">{stats.inProgress}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Completed</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.completed}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, street or asset..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned (Not Started)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Card-based Work Orders List (Mobile-friendly for field workers) */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs">Loading assigned work orders...</p>
          </div>
        ) : workOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No work orders currently assigned</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! New dispatch assignments from municipal officers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workOrders.map((wo) => {
              const isActionLoading = actionLoadingId === wo.id;

              return (
                <div
                  key={wo.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg space-y-4"
                >
                  {/* Top Bar: Code, Badges, SLA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-700">
                        {wo.workOrderCode}
                      </span>
                      <WorkOrderStatusBadge status={wo.status} />
                    </div>

                    <WorkOrderSlaBadge
                      slaDeadline={wo.slaDeadline}
                      slaBreached={wo.slaBreached}
                      status={wo.status}
                    />
                  </div>

                  {/* Body: Complaint & Asset Info */}
                  <div className="space-y-2 text-xs">
                    {wo.complaint && (
                      <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                          <span className="capitalize font-bold text-white">
                            {wo.complaint.category?.toLowerCase().replace('_', ' ')} Repair
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{wo.complaint.complaintCode}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                          {wo.complaint.description}
                        </p>
                      </div>
                    )}

                    {/* Location & Coordinates */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      {wo.complaint?.address && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-medium">{wo.complaint.address}</span>
                        </div>
                      )}

                      {wo.asset && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span>Asset: {wo.asset.assetCode} ({wo.asset.name})</span>
                        </div>
                      )}

                      {wo.slaDeadline && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Deadline: {new Date(wo.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Bar for Field Worker */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <Link
                      to={`/worker/work-orders/${wo.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      <span>View Full Details & Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {wo.status === 'ASSIGNED' && (
                        <button
                          onClick={(e) => handleStartWork(wo.id, e)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{isActionLoading ? 'Starting...' : 'Start Work'}</span>
                        </button>
                      )}

                      {wo.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setCompleteOrder(wo)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}

                      {wo.status === 'COMPLETED' && (
                        <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          Awaiting Verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Complete Work Modal */}
      <CompleteWorkModal
        isOpen={Boolean(completeOrder)}
        onClose={() => setCompleteOrder(null)}
        workOrder={completeOrder}
        onCompleted={handleWorkCompleted}
      />
    </div>
  );
}

export default WorkerWorkOrders;
