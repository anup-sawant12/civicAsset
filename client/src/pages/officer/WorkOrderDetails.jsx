import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfficerHeader from '../../components/officer/OfficerHeader';
import { WorkOrderStatusBadge, WorkOrderSlaBadge } from '../../components/workOrders/WorkOrderBadges';
import WorkOrderTimeline from '../../components/workOrders/WorkOrderTimeline';
import WorkOrderMapCard from '../../components/workOrders/WorkOrderMapCard';
import AssignWorkerModal from '../../components/workOrders/AssignWorkerModal';
import CompleteWorkModal from '../../components/workOrders/CompleteWorkModal';
import workOrderService from '../../services/workOrderService';
import {
  ArrowLeft,
  Wrench,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building,
  Layers,
  ClipboardList,
  Camera,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Clock,
} from 'lucide-react';

export function OfficerWorkOrderDetails() {
  const { id } = useParams();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
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

  const handleCancelWorkOrder = async () => {
    const reason = window.prompt('Please enter cancellation justification:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await workOrderService.cancelWorkOrder(id, reason);
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyWorkOrder = async () => {
    if (!window.confirm('Are you sure you want to verify this completed work order?')) return;
    setActionLoading(true);
    try {
      const res = await workOrderService.updateWorkOrderStatus(id, 'VERIFIED');
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify work order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRework = async () => {
    const reason = window.prompt('Please enter rework instructions for the field worker:');
    if (!reason) return;
    setActionLoading(true);
    try {
      const res = await workOrderService.updateWorkOrderStatus(id, 'IN_PROGRESS', { reworkReason: reason });
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request rework.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseWorkOrder = async () => {
    if (!window.confirm('Are you sure you want to close and archive this work order?')) return;
    setActionLoading(true);
    try {
      const res = await workOrderService.updateWorkOrderStatus(id, 'CLOSED');
      if (res.success) {
        setWorkOrder(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close work order.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <OfficerHeader activePage="work orders" />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <OfficerHeader activePage="work orders" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Error Loading Work Order</h2>
            <p className="text-xs text-slate-400">{error || 'Work order record not found.'}</p>
            <Link
              to="/officer/work-orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Work Orders Queue</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { complaint, asset, department, assignedWorker } = workOrder;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <OfficerHeader activePage="work orders" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/officer/work-orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Orders Queue</span>
        </Link>

        {/* Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="font-mono text-base font-bold text-cyan-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 shadow-inner">
                  {workOrder.workOrderCode}
                </span>
                <WorkOrderStatusBadge status={workOrder.status} />
                <WorkOrderSlaBadge
                  slaDeadline={workOrder.slaDeadline}
                  slaBreached={workOrder.slaBreached}
                  status={workOrder.status}
                />
              </div>
              <h1 className="text-xl font-bold text-white">
                Municipal Infrastructure Work Order
              </h1>
              <span className="text-xs text-slate-400 block mt-0.5">
                Issued on {new Date(workOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(workOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Officer Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'].includes(workOrder.status) && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{assignedWorker ? 'Reassign Worker' : 'Assign Worker'}</span>
                </button>
              )}

              {workOrder.status === 'ASSIGNED' && (
                <button
                  onClick={handleStartWork}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Start Work</span>
                </button>
              )}

              {workOrder.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}

              {workOrder.status === 'COMPLETED' && (
                <>
                  <button
                    onClick={handleVerifyWorkOrder}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Work Order</span>
                  </button>
                  <button
                    onClick={handleRequestRework}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Request Rework</span>
                  </button>
                </>
              )}

              {workOrder.status === 'VERIFIED' && (
                <button
                  onClick={handleCloseWorkOrder}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Close & Archive Order</span>
                </button>
              )}

              {!['CLOSED', 'CANCELLED'].includes(workOrder.status) && (
                <button
                  onClick={handleCancelWorkOrder}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>

          {/* SLA Quick Status Indicator */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                SLA Deadline:{' '}
                <strong className="text-white">
                  {workOrder.slaDeadline
                    ? new Date(workOrder.slaDeadline).toLocaleString()
                    : 'Unspecified'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Department: <strong className="text-white">{department?.name || 'Unassigned'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <WorkOrderTimeline workOrder={workOrder} />

        {/* Before & After Photo Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Repair Photo */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Before Repair (Reported Damage)
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Incident State</span>
            </div>

            {workOrder.beforeImageUrl ? (
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <img
                  src={workOrder.beforeImageUrl}
                  alt="Damage condition before repair"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-56 rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col items-center justify-center text-xs text-slate-500 space-y-1">
                <Camera className="w-6 h-6 text-slate-600 mb-1" />
                <span>No before-repair photograph supplied.</span>
              </div>
            )}
          </div>

          {/* After Repair Photo */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  After Repair (Field Evidence)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">
                {workOrder.completedAt ? 'Resolved Proof' : 'Pending Work'}
              </span>
            </div>

            {workOrder.afterImageUrl ? (
              <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <img
                  src={workOrder.afterImageUrl}
                  alt="Completed repair evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-56 rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col items-center justify-center text-xs text-slate-500 space-y-1">
                <Wrench className="w-6 h-6 text-slate-600 mb-1" />
                <span>Pending completion evidence photo from field personnel.</span>
              </div>
            )}
          </div>
        </div>

        {/* Repair Notes & Details */}
        {workOrder.repairNotes && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Field Repair Notes & Technical Remarks</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {workOrder.repairNotes}
            </div>
          </div>
        )}

        {/* Originating Complaint & Associated Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Originating Complaint Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Originating Complaint</span>
              </h2>
              {complaint && (
                <Link
                  to={`/officer/complaints/${complaint.id}`}
                  className="font-mono text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>{complaint.complaintCode}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {complaint ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Category</span>
                  <span className="text-sm font-semibold text-white capitalize mt-0.5 block">
                    {complaint.category?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Description</span>
                  <p className="text-slate-300 leading-relaxed">{complaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Priority</span>
                    <span className="font-semibold text-amber-400">{complaint.priority}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Severity</span>
                    <span className="font-semibold text-rose-400">{complaint.severity}</span>
                  </div>
                </div>

                {complaint.citizen && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400">
                    <span>Reporter: {complaint.citizen.firstName} {complaint.citizen.lastName}</span>
                    <span>{complaint.citizen.phone || complaint.citizen.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                No linked complaint record.
              </div>
            )}
          </div>

          {/* Associated Asset Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Associated Municipal Asset</span>
              </h2>
              {asset && (
                <Link
                  to={`/admin/assets/${asset.id}`}
                  className="font-mono text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{asset.assetCode}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {asset ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Asset Name</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{asset.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Asset Type</span>
                    <span className="font-semibold text-cyan-400 capitalize">{asset.assetType}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Condition</span>
                    <span className="font-semibold text-white capitalize">{asset.condition}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Operating Status</span>
                  <span className="font-semibold text-emerald-400 block">{asset.status}</span>
                  {asset.address && <p className="text-slate-400 text-[11px]">{asset.address}</p>}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                No specific physical infrastructure asset was attached to this work ticket.
              </div>
            )}
          </div>
        </div>

        {/* Field Personnel & GIS Site Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personnel Assignment Info */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Assigned Field Personnel</span>
            </h2>

            {assignedWorker ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      {assignedWorker.firstName[0]}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {assignedWorker.firstName} {assignedWorker.lastName}
                      </span>
                      <span className="text-[10px] text-amber-400 uppercase font-semibold">
                        Field Worker Qualified
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300 truncate">{assignedWorker.email}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{assignedWorker.phone || 'No phone'}</span>
                  </div>
                </div>

                {workOrder.assignedAt && (
                  <p className="text-[11px] text-slate-400 pt-1">
                    Dispatched on {new Date(workOrder.assignedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-amber-500/50 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No field worker assigned yet.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Personnel Now</span>
                </button>
              </div>
            )}
          </div>

          {/* GIS Site Location Card */}
          <WorkOrderMapCard
            latitude={complaint?.latitude}
            longitude={complaint?.longitude}
            address={complaint?.address}
            workOrderCode={workOrder.workOrderCode}
            asset={asset}
          />
        </div>
      </main>

      {/* Assign Field Worker Modal */}
      <AssignWorkerModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        workOrder={workOrder}
        onAssigned={(updated) => setWorkOrder(updated)}
      />

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

export default OfficerWorkOrderDetails;
