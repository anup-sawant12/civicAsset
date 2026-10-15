import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CitizenHeader from '../../components/citizen/CitizenHeader';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import complaintService from '../../services/complaintService';
import { PlusCircle, Search, RotateCcw, AlertTriangle } from 'lucide-react';

export function CitizenComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.getComplaints({
        page,
        limit: 10,
        search,
        status,
      });
      if (res.success) {
        setComplaints(res.data.complaints || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error('Failed to load citizen complaints:', err);
      setError(err.response?.data?.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <CitizenHeader activePage="my complaints" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & New Complaint Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Civic Complaints</h1>
            <p className="text-xs text-slate-400 mt-1">
              Track real-time municipal responses, repair scheduling, and verification for your submitted issues.
            </p>
          </div>

          <Link
            to="/citizen/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by complaint code (e.g. CMP-10001) or description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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

            {(search || status) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setPage(1);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Complaints Table */}
        <ComplaintTable
          complaints={complaints}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          detailsBasePath="/citizen/complaints"
          emptyMessage="No complaints submitted yet"
        />
      </main>
    </div>
  );
}

export default CitizenComplaints;
