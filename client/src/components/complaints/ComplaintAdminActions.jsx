import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import complaintService from '../../services/complaintService';
import CreateWorkOrderModal from '../workOrders/CreateWorkOrderModal';

export function ComplaintAdminActions({ complaint, onUpdate, departments = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateWoModal, setShowCreateWoModal] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.updateComplaintStatus(complaint.id, newStatus);
      if (res.success) {
        onUpdate(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.updateComplaintPriority(complaint.id, newPriority);
      if (res.success) {
        onUpdate({ ...complaint, priority: newPriority });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeverityChange = async (e) => {
    const newSeverity = e.target.value;
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.updateComplaintSeverity(complaint.id, newSeverity);
      if (res.success) {
        onUpdate({ ...complaint, severity: newSeverity });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update severity.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (e) => {
    const newDeptId = e.target.value;
    if (!newDeptId) return;
    setLoading(true);
    setError('');
    try {
      const res = await complaintService.updateComplaintDepartment(complaint.id, newDeptId);
      if (res.success) {
        onUpdate(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Municipal Officer Actions & Triage</span>
        </h2>
        {loading && <span className="text-xs text-cyan-400 animate-pulse font-medium">Applying updates...</span>}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Work Order Dispatch & Association */}
      {complaint.workOrder ? (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Work Order Active:</span>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {complaint.workOrder.workOrderCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {complaint.workOrder.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Municipal maintenance operations are currently dispatched.
              </span>
            </div>
          </div>
          <Link
            to={`/officer/work-orders/${complaint.workOrder.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>Open Work Order</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        complaint.status !== 'REJECTED' &&
        complaint.status !== 'CLOSED' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-950 to-blue-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-xs font-bold text-white block">Municipal Operations Dispatch</span>
              <span className="text-[11px] text-slate-400">
                Ready to schedule field repair crew and generate maintenance work order.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateWoModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Generate Work Order</span>
            </button>
          </div>
        )
      )}

      {/* Quick Status Progression Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase text-slate-400 block">Advance Workflow Status:</span>
        <div className="flex flex-wrap gap-2">
          {complaint.status === 'SUBMITTED' && (
            <button
              onClick={() => handleStatusChange('UNDER_REVIEW')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Accept & Review</span>
            </button>
          )}

          {(complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW') && (
            <button
              onClick={() => handleStatusChange('ASSIGNED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Assigned</span>
            </button>
          )}

          {complaint.status === 'ASSIGNED' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Set In Progress</span>
            </button>
          )}

          {complaint.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}

          {(complaint.status === 'RESOLVED' || complaint.status === 'VERIFIED') && (
            <button
              onClick={() => handleStatusChange('CLOSED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Close Case</span>
            </button>
          )}

          {complaint.status !== 'REJECTED' && complaint.status !== 'CLOSED' && (
            <button
              onClick={() => handleStatusChange('REJECTED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer ml-auto"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* Adjust Severity, Priority & Department Routing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Set Priority</label>
          <select
            value={complaint.priority}
            onChange={handlePriorityChange}
            disabled={loading}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent Priority</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Set Severity</label>
          <select
            value={complaint.severity}
            onChange={handleSeverityChange}
            disabled={loading}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Hazard</option>
            <option value="CRITICAL">Critical Danger</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reassign Department</label>
          <select
            value={complaint.departmentId || ''}
            onChange={handleDepartmentChange}
            disabled={loading}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={showCreateWoModal}
        onClose={() => setShowCreateWoModal(false)}
        complaint={complaint}
        onCreated={(newWo) => {
          onUpdate({
            ...complaint,
            status: complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW' ? 'ASSIGNED' : complaint.status,
            workOrder: newWo,
          });
        }}
      />
    </div>
  );
}

export default ComplaintAdminActions;
