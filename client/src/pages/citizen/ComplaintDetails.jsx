import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import CitizenHeader from '../../components/citizen/CitizenHeader';
import ComplaintLifecycle from '../../components/complaints/ComplaintLifecycle';
import ComplaintMapCard from '../../components/complaints/ComplaintMapCard';
import {
  ComplaintStatusBadge,
  ComplaintSeverityBadge,
  ComplaintPriorityBadge,
} from '../../components/complaints/ComplaintBadges';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import complaintService from '../../services/complaintService';
import {
  ArrowLeft,
  Building,
  Calendar,
  Camera,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export function CitizenComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success) {
        setComplaint(res.data);
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleCancelComplaint = async () => {
    try {
      const res = await complaintService.cancelComplaint(id);
      if (res.success) {
        setComplaint(res.data);
        setFeedback({ type: 'success', message: 'Complaint has been successfully cancelled.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel complaint.',
      });
    } finally {
      setIsCancelModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <CitizenHeader activePage="my complaints" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400">Loading complaint details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <CitizenHeader activePage="my complaints" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Error Loading Complaint</h2>
            <p className="text-xs text-slate-400">{error || 'Complaint record not found.'}</p>
            <Link
              to="/citizen/complaints"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Complaints</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const canCancel = complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <CitizenHeader activePage="my complaints" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Breadcrumb & Action */}
        <div className="flex items-center justify-between">
          <Link
            to="/citizen/complaints"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Complaints</span>
          </Link>

          {canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Complaint</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-center justify-between border ${
              feedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-cyan-400 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700">
                  {complaint.complaintCode}
                </span>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
              <h1 className="text-xl font-bold text-white mt-1 capitalize">
                {complaint.category?.toLowerCase().replace('_', ' ')} Issue
              </h1>
            </div>

            <div className="flex items-center gap-2">
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

        {/* Lifecycle Stepper */}
        <ComplaintLifecycle
          status={complaint.status}
          submittedAt={complaint.submittedAt}
          resolvedAt={complaint.resolvedAt}
          closedAt={complaint.closedAt}
        />

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department & Asset Info */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Municipal Routing</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Department</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {complaint.department?.name || 'Department Triage Pending'}
                </span>
              </div>

              {complaint.asset ? (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Linked Municipal Asset</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{complaint.asset.assetCode}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{complaint.asset.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{complaint.asset.assetType?.toLowerCase()}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
                  No registered physical asset was linked to this citizen complaint.
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-400 pt-2 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Submitted on {new Date(complaint.submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Incident GIS Map Card */}
          <ComplaintMapCard
            latitude={complaint.latitude}
            longitude={complaint.longitude}
            address={complaint.address}
            complaintCode={complaint.complaintCode}
            asset={complaint.asset}
          />
        </div>

        {/* Evidence Photo Viewer */}
        {complaint.imageUrl && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              <span>Photographic Evidence</span>
            </h2>

            <div className="max-w-md rounded-xl overflow-hidden border border-slate-800 shadow-xl">
              <img
                src={complaint.imageUrl}
                alt={`Evidence for ${complaint.complaintCode}`}
                className="w-full h-auto object-cover max-h-80"
              />
            </div>
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Civic Complaint?"
        message="Are you sure you want to cancel this complaint? The record will remain archived but municipal triage will cease."
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleCancelComplaint}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}

export default CitizenComplaintDetails;
