import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import WorkerHeader from '../../components/worker/WorkerHeader';
import { WorkOrderStatusBadge, WorkOrderSlaBadge } from '../../components/workOrders/WorkOrderBadges';
import WorkOrderTimeline from '../../components/workOrders/WorkOrderTimeline';
import WorkOrderMapCard from '../../components/workOrders/WorkOrderMapCard';
import CompleteWorkModal from '../../components/workOrders/CompleteWorkModal';
import workOrderService from '../../services/workOrderService';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ClipboardList,
  Camera,
  FileText,
  Navigation,
} from 'lucide-react';

export function WorkerWorkOrderDetails() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workOrderService.getWorkOrderById(id);
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to load work order details:', err);
      setError(err.response?.data?.message || 'Failed to load work order record.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await workOrderService.startWork(id);
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <WorkerHeader activePage="my work orders" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <WorkerHeader activePage="my work orders" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Access Denied or Not Found</h2>
            <p className="text-xs text-slate-400">{error || 'Work order record could not be loaded.'}</p>
            <Link
              to="/worker/work-orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Work Orders</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { complaint, asset } = workOrder;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <WorkerHeader activePage="my work orders" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/worker/work-orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Work Orders</span>
        </Link>

        {/* Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-base font-bold text-cyan-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700">
                  {workOrder.workOrderCode}
                </span>
                <WorkOrderStatusBadge status={workOrder.status} />
              </div>
              <h1 className="text-xl font-bold text-white">
                {complaint?.category?.toLowerCase().replace('_', ' ') || 'Infrastructure'} Field Repair
              </h1>
              {complaint?.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{complaint.address}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SLA Status</span>
              <WorkOrderSlaBadge
                slaDeadline={workOrder.slaDeadline}
                slaBreached={workOrder.slaBreached}
                status={workOrder.status}
              />
            </div>
          </div>

          {/* Large Action Buttons (Field worker mobile convenience) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">Current Work Status</span>
              <span className="text-[11px] text-slate-400">
                {workOrder.status === 'ASSIGNED' && 'Task is assigned to you and ready to commence on-site.'}
                {workOrder.status === 'IN_PROGRESS' && 'Repair is underway. Add notes and photo proof once done.'}
                {workOrder.status === 'COMPLETED' && 'Work completed and submitted for officer inspection.'}
                {workOrder.status === 'VERIFIED' && 'Verified by municipal officer.'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {workOrder.status === 'ASSIGNED' && (
                <button
                  onClick={handleStartWork}
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{actionLoading ? 'Starting Work...' : 'Start Work Now'}</span>
                </button>
              )}

              {workOrder.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Work Completed</span>
                </button>
              )}

              {workOrder.status === 'COMPLETED' && (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submitted for Verification</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <WorkOrderTimeline workOrder={workOrder} />

        {/* GIS Map & Site Location */}
        <WorkOrderMapCard
          latitude={complaint?.latitude}
          longitude={complaint?.longitude}
          address={complaint?.address}
          workOrderCode={workOrder.workOrderCode}
          asset={asset}
          height="280px"
        />

        {/* Photos Card: Before Repair & After Repair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Damage Photo (Citizen Report)</span>
              </h3>
            </div>
            {workOrder.beforeImageUrl ? (
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={workOrder.beforeImageUrl}
                  alt="Reported damage"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-56 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-center text-xs text-slate-500">
                No initial photo attached to report.
              </div>
            )}
          </div>

          {/* After Photo / Completion Proof */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>After Repair Photographic Proof</span>
              </h3>
            </div>
            {workOrder.afterImageUrl ? (
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={workOrder.afterImageUrl}
                  alt="Repair proof"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-56 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-xs text-slate-500 space-y-2 p-4 text-center">
                <Wrench className="w-6 h-6 text-slate-600" />
                <span>Photo will be uploaded when you mark the repair completed.</span>
                {workOrder.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Submit Photo & Notes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Repair Notes Submitted */}
        {workOrder.repairNotes && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Your Submitted Repair Notes</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap">
              {workOrder.repairNotes}
            </div>
          </div>
        )}

        {/* Complaint Details Card */}
        {complaint && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>Problem Description & Severity</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {complaint.description}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Severity</span>
                <span className="font-semibold text-rose-400">{complaint.severity}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Priority</span>
                <span className="font-semibold text-amber-400">{complaint.priority}</span>
              </div>
            </div>
          </div>
        )}

        {/* Asset Details Card */}
        {asset && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Target Municipal Asset</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white text-sm block">{asset.name}</span>
                <span className="text-slate-400 capitalize">{asset.assetType} • Condition: {asset.condition}</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {asset.assetCode}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Complete Work Modal */}
      <CompleteWorkModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        workOrder={workOrder}
        onCompleted={(updated) => setWorkOrder(updated)}
      />
    </div>
  );
}

export default WorkerWorkOrderDetails;
