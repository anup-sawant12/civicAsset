import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import ComplaintLifecycle from '../../components/complaints/ComplaintLifecycle';
import ComplaintMapCard from '../../components/complaints/ComplaintMapCard';
import ComplaintAdminActions from '../../components/complaints/ComplaintAdminActions';
import {
  ComplaintStatusBadge,
  ComplaintSeverityBadge,
  ComplaintPriorityBadge,
} from '../../components/complaints/ComplaintBadges';
import complaintService from '../../services/complaintService';
import departmentService from '../../services/departmentService';
import {
  ArrowLeft,
  Layers,
  Calendar,
  Camera,
  AlertTriangle,
  User,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

export function AdminComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cmpRes, deptRes] = await Promise.all([
        complaintService.getComplaintById(id),
        departmentService.getDepartments({ limit: 100 }),
      ]);
      if (cmpRes.success) {
        setComplaint(cmpRes.data);
      }
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setError(err.response?.data?.message || 'Failed to load complaint.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AdminHeader activePage="complaints" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AdminHeader activePage="complaints" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Error Loading Complaint</h2>
            <p className="text-xs text-slate-400">{error || 'Complaint record not found.'}</p>
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Complaints Queue</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="complaints" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Queue</span>
        </Link>

        {/* Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-rose-400 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700">
                  {complaint.complaintCode}
                </span>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
              <h1 className="text-xl font-bold text-white mt-1 capitalize">
                {complaint.category?.toLowerCase().replace('_', ' ')} Incident Record
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Severity</span>
                <ComplaintSeverityBadge severity={complaint.severity} />
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Priority</span>
                <ComplaintPriorityBadge priority={complaint.priority} />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">{complaint.description}</p>
        </div>

        {/* Admin Actions Bar */}
        <ComplaintAdminActions
          complaint={complaint}
          departments={departments}
          onUpdate={(updated) => setComplaint(updated)}
        />

        {/* Lifecycle Stepper */}
        <ComplaintLifecycle
          status={complaint.status}
          submittedAt={complaint.submittedAt}
          resolvedAt={complaint.resolvedAt}
          closedAt={complaint.closedAt}
        />

        {/* Grid: Reporter Information & Department / Asset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Citizen Reporter Info */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Citizen Reporter</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Reporter Name</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {complaint.citizen?.firstName} {complaint.citizen?.lastName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-300 truncate">{complaint.citizen?.email}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-300">{complaint.citizen?.phone || 'No phone recorded'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 pt-2 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Submitted on {new Date(complaint.submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Linked Asset & Department */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Asset & Division</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Sector</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {complaint.department?.name || 'Unassigned'}
                </span>
              </div>

              {complaint.asset ? (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Associated Municipal Asset</span>
                    <Link
                      to={`/admin/assets/${complaint.asset.id}`}
                      className="font-mono text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{complaint.asset.assetCode}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-sm font-semibold text-white">{complaint.asset.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{complaint.asset.assetType?.toLowerCase()}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
                  No registered physical asset was linked.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map & Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComplaintMapCard
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            address={complaint.address}
            complaintCode={complaint.complaintCode}
            asset={complaint.asset}
          />

          {complaint.imageUrl ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Uploaded Evidence</span>
              </h2>
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <img
                  src={complaint.imageUrl}
                  alt={`Evidence for ${complaint.complaintCode}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
              <span>No photo evidence attached to this ticket.</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminComplaintDetails;
