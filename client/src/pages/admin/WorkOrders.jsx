import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { WorkOrderStatusBadge, WorkOrderSlaBadge } from '../../components/workOrders/WorkOrderBadges';
import AssignWorkerModal from '../../components/workOrders/AssignWorkerModal';
import workOrderService from '../../services/workOrderService';
import departmentService from '../../services/departmentService';
import {
  Wrench,
  Search,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  User,
} from 'lucide-react';

export function AdminWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    created: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    slaBreached: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await workOrderService.getWorkOrderStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments({ limit: 100 });
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workOrderService.getWorkOrders({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        departmentId: deptFilter || undefined,
        slaBreached: slaFilter !== '' ? slaFilter : undefined,
      });

      if (res.success) {
        setWorkOrders(res.data.workOrders || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch work orders.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, deptFilter, slaFilter]);

  useEffect(() => {
    fetchStats();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchWorkOrders]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleWorkerAssigned = (updatedOrder) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === updatedOrder.id ? { ...wo, ...updatedOrder } : wo))
    );
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="work orders" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Municipal Authority Oversight
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Work Orders Management</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Cross-departmental monitoring of municipal maintenance dispatch, field repairs, and SLA compliance.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchWorkOrders();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Orders</span>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Created</span>
            <span className="text-2xl font-bold text-slate-300">{stats.created}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Assigned</span>
            <span className="text-2xl font-bold text-amber-400">{stats.assigned}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">In Progress</span>
            <span className="text-2xl font-bold text-cyan-400">{stats.inProgress}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Completed</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.completed}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">SLA Breached</span>
            <span className="text-2xl font-bold text-rose-400">{stats.slaBreached}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search WO code, complaint, asset..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="VERIFIED">Verified</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={slaFilter}
                onChange={(e) => {
                  setSlaFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All SLA Deadlines</option>
                <option value="true">Breached SLA Only</option>
                <option value="false">Within SLA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
          {error && (
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Work Order</th>
                  <th className="px-4 py-3.5">Complaint</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Worker</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">SLA</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Loading work orders data...</p>
                    </td>
                  </tr>
                ) : workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-300">No work orders recorded.</p>
                    </td>
                  </tr>
                ) : (
                  workOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/admin/work-orders/${wo.id}`}
                          className="font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>{wo.workOrderCode}</span>
                          <ExternalLink className="w-3 h-3 text-cyan-500/70" />
                        </Link>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {wo.complaint ? (
                          <div>
                            <Link
                              to={`/admin/complaints/${wo.complaint.id}`}
                              className="font-mono text-xs font-semibold text-slate-200 hover:text-white"
                            >
                              {wo.complaint.complaintCode}
                            </Link>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {wo.complaint.category?.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {wo.asset ? (
                          <div>
                            <Link
                              to={`/admin/assets/${wo.asset.id}`}
                              className="font-mono text-[11px] font-semibold text-emerald-400 hover:underline"
                            >
                              {wo.asset.assetCode}
                            </Link>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                              {wo.asset.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Unlinked</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 font-medium">
                          {wo.department?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {wo.assignedWorker ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-white font-medium">
                              {wo.assignedWorker.firstName} {wo.assignedWorker.lastName}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedOrderForAssign(wo)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <WorkOrderStatusBadge status={wo.status} />
                      </td>

                      <td className="px-4 py-3.5">
                        <WorkOrderSlaBadge
                          slaDeadline={wo.slaDeadline}
                          slaBreached={wo.slaBreached}
                          status={wo.status}
                        />
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/admin/work-orders/${wo.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-white font-bold px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AssignWorkerModal
        isOpen={Boolean(selectedOrderForAssign)}
        onClose={() => setSelectedOrderForAssign(null)}
        workOrder={selectedOrderForAssign}
        onAssigned={handleWorkerAssigned}
      />
    </div>
  );
}

export default AdminWorkOrders;
