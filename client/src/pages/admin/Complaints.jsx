import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import complaintService from '../../services/complaintService';
import departmentService from '../../services/departmentService';
import {
  AlertTriangle,
  ClipboardList,
  Search,
  RotateCcw,
} from 'lucide-react';

export function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    severity: '',
    priority: '',
    departmentId: '',
  });

  // Fetch departments & live stats
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      try {
        const [deptRes, statsRes] = await Promise.all([
          departmentService.getDepartments({ limit: 100 }),
          complaintService.getComplaintStats(),
        ]);
        if (isMounted) {
          if (deptRes.success) setDepartments(deptRes.departments || []);
          if (statsRes.success) setStats(statsRes.data || {});
        }
      } catch (err) {
        console.error('Failed to load complaint metadata:', err);
      }
    }
    loadMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.getComplaints({
        page,
        limit: 10,
        ...filters,
      });
      if (res.success) {
        setComplaints(res.data.complaints || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error('Failed to fetch admin complaints:', err);
      setError(err.response?.data?.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      severity: '',
      priority: '',
      departmentId: '',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="complaints" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Municipal Incident Command
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <ClipboardList className="w-6 h-6 text-rose-400" />
              Civic Complaints & Public Reports
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              System-wide citizen incident registry, dispatch tracking, departmental routing, and resolution oversight.
            </p>
          </div>
        </div>

        {/* Live Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Total Reports</span>
            <span className="text-xl font-bold text-white mt-1 block">{stats.total}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">New / Submitted</span>
            <span className="text-xl font-bold text-blue-400 mt-1 block">{stats.submitted}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">In Progress</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">{stats.inProgress}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Resolved</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{stats.resolved}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Closed Cases</span>
            <span className="text-xl font-bold text-slate-400 mt-1 block">{stats.closed}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Critical Hazard</span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">{stats.critical}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search complaint code, address, or keyword..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="VERIFIED">Verified</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">All Severities</option>
                <option value="LOW">Low Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="CRITICAL">Critical Severity</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              <select
                value={filters.departmentId}
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <ComplaintTable
          complaints={complaints}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          detailsBasePath="/admin/complaints"
          emptyMessage="No civic complaints found"
        />
      </main>
    </div>
  );
}

export default AdminComplaints;
