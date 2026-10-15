import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import OfficerHeader from '../../components/officer/OfficerHeader';
import { WorkOrderStatusBadge, WorkOrderSlaBadge } from '../../components/workOrders/WorkOrderBadges';
import AssignWorkerModal from '../../components/workOrders/AssignWorkerModal';
import workOrderService from '../../services/workOrderService';
import departmentService from '../../services/departmentService';
import {
  Wrench,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
} from 'lucide-react';

export function OfficerWorkOrders() {
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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assign worker modal state
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

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

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments({ limit: 100 });
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
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

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchDepartments();
  }, []);

  // Fetch when filters change (with debounce on search)
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
      <OfficerHeader activePage="work orders" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Municipal Operations Dispatch
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Work Orders Queue</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Track maintenance operations, dispatch qualified field personnel, monitor SLA resolution times, and review completed repairs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStats();
                fetchWorkOrders();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Orders</span>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-2xl font-bold text-slate-300">{stats.created}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Assigned</span>
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-amber-400">{stats.assigned}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">In Progress</span>
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-cyan-400">{stats.inProgress}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-emerald-400">{stats.completed}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">SLA Breached</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-2xl font-bold text-rose-400">{stats.slaBreached}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search WO code, complaint, asset..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="CREATED">Created (Unassigned)</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="VERIFIED">Verified</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SLA Filter */}
            <div>
              <select
                value={slaFilter}
                onChange={(e) => {
                  setSlaFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All SLA Deadlines</option>
                <option value="true">Breached SLA Only</option>
                <option value="false">Within SLA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Order Table */}
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
                  <th className="px-4 py-3.5">Originating Complaint</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Assigned Worker</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">SLA Deadline</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Loading work orders data...</p>
                    </td>
                  </tr>
                ) : workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-300">No work orders found.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search criteria or create a work order from the Complaints queue.
                      </p>
                    </td>
                  </tr>
                ) : (
                  workOrders.map((wo) => {
                    return (
                      <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Work Order Code */}
                        <td className="px-4 py-3.5">
                          <Link
                            to={`/officer/work-orders/${wo.id}`}
                            className="font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <span>{wo.workOrderCode}</span>
                            <ExternalLink className="w-3 h-3 text-cyan-500/70" />
                          </Link>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(wo.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Complaint Info */}
                        <td className="px-4 py-3.5">
                          {wo.complaint ? (
                            <div>
                              <Link
                                to={`/officer/complaints/${wo.complaint.id}`}
                                className="font-mono text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1"
                              >
                                <span>{wo.complaint.complaintCode}</span>
                              </Link>
                              <span className="text-[10px] text-slate-400 block capitalize truncate max-w-[140px]">
                                {wo.complaint.category?.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Asset */}
                        <td className="px-4 py-3.5">
                          {wo.asset ? (
                            <div>
                              <Link
                                to={`/admin/assets/${wo.asset.id}`}
                                className="font-mono text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <span>{wo.asset.assetCode}</span>
                              </Link>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                                {wo.asset.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Unlinked</span>
                          )}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5">
                          <span className="text-slate-300 font-medium">
                            {wo.department?.name || 'Unassigned'}
                          </span>
                        </td>

                        {/* Assigned Worker */}
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
                              <span>Assign Worker</span>
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <WorkOrderStatusBadge status={wo.status} />
                        </td>

                        {/* SLA */}
                        <td className="px-4 py-3.5">
                          <WorkOrderSlaBadge
                            slaDeadline={wo.slaDeadline}
                            slaBreached={wo.slaBreached}
                            status={wo.status}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/officer/work-orders/${wo.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                            >
                              Details
                            </Link>

                            {!wo.assignedWorker && !['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(wo.status) && (
                              <button
                                onClick={() => setSelectedOrderForAssign(wo)}
                                title="Assign Worker"
                                className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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

      {/* Assign Field Worker Modal */}
      <AssignWorkerModal
        isOpen={Boolean(selectedOrderForAssign)}
        onClose={() => setSelectedOrderForAssign(null)}
        workOrder={selectedOrderForAssign}
        onAssigned={handleWorkerAssigned}
      />
    </div>
  );
}

export default OfficerWorkOrders;
