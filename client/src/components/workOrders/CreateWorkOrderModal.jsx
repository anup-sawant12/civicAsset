import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Wrench,
  AlertTriangle,
  Building,
  UserCheck,
  Calendar,
  Layers,
  Camera,
  ClipboardList,
} from 'lucide-react';
import userService from '../../services/userService';
import departmentService from '../../services/departmentService';
import workOrderService from '../../services/workOrderService';

function computeFutureDeadline(hours) {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString().slice(0, 16);
}

export function CreateWorkOrderModal({ isOpen, onClose, complaint, onCreated }) {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    departmentId: '',
    assetId: '',
    assignedWorkerId: '',
    slaHours: '48',
    slaDeadline: '',
    beforeImageUrl: '',
  });

  const loadDepartmentsAndWorkers = async () => {
    setLoadingInitial(true);
    try {
      const [deptRes, workerRes] = await Promise.all([
        departmentService.getDepartments({ limit: 100 }),
        userService.getUsers({ role: 'FIELD_WORKER', status: 'ACTIVE' }),
      ]);
      setDepartments(deptRes.departments || []);
      setWorkers(workerRes.users || []);
    } catch (err) {
      console.error('Failed to load modal prerequisites:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    if (isOpen && complaint) {
      setError('');
      // Set initial form state based on complaint
      // Calculate 48h default deadline
      const isoString = computeFutureDeadline(48);

      setFormData({
        departmentId: complaint.departmentId || '',
        assetId: complaint.assetId || '',
        assignedWorkerId: '',
        slaHours: '48',
        slaDeadline: isoString,
        beforeImageUrl: complaint.imageUrl || '',
      });

      loadDepartmentsAndWorkers();
    }
  }, [isOpen, complaint]);

  const handleSlaPreset = (hours) => {
    setFormData((prev) => ({
      ...prev,
      slaHours: String(hours),
      slaDeadline: computeFutureDeadline(hours),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        complaintId: complaint.id,
        departmentId: formData.departmentId || complaint.departmentId,
        assetId: formData.assetId || complaint.assetId || undefined,
        assignedWorkerId: formData.assignedWorkerId || undefined,
        slaDeadline: formData.slaDeadline ? new Date(formData.slaDeadline).toISOString() : undefined,
        slaHours: formData.slaHours ? parseInt(formData.slaHours, 10) : undefined,
        beforeImageUrl: formData.beforeImageUrl.trim() || undefined,
      };

      const res = await workOrderService.createWorkOrder(payload);
      if (res.success) {
        if (onCreated) {
          onCreated(res.data);
        }
        onClose();
        // Option to navigate to newly generated work order
        navigate(`/officer/work-orders/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate work order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !complaint) return null;

  // Filter workers based on selected department
  const filteredWorkers = formData.departmentId
    ? workers.filter((w) => !w.departmentId || w.departmentId === formData.departmentId)
    : workers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Generate Work Order</h2>
              <p className="text-xs text-slate-400">
                Originating Complaint: <span className="font-mono text-cyan-400">{complaint.complaintCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Complaint Context Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-white capitalize">
                  {complaint.category?.toLowerCase().replace('_', ' ')} Incident
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {complaint.priority} Priority
              </span>
            </div>
            <p className="text-slate-300 text-[11px] line-clamp-2">{complaint.description}</p>
            {complaint.address && (
              <p className="text-slate-400 text-[10px] truncate">Location: {complaint.address}</p>
            )}
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Assigned Department *</span>
            </label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Select Responsible Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Associated Asset Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Municipal Infrastructure Asset</span>
            </label>
            {complaint.asset ? (
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{complaint.asset.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{complaint.asset.assetType}</span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {complaint.asset.assetCode}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-800 text-xs text-slate-500">
                No specific physical asset linked to this complaint ticket.
              </div>
            )}
          </div>

          {/* Assign Field Worker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Assign Field Worker (Optional now, can be dispatched later)</span>
            </label>
            <select
              value={formData.assignedWorkerId}
              onChange={(e) => setFormData({ ...formData, assignedWorkerId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Leave Unassigned (Will set status to CREATED) --</option>
              {filteredWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName} {w.department ? `(${w.department.name})` : ''} - {w.phone || w.email}
                </option>
              ))}
            </select>
          </div>

          {/* SLA Deadline Configuration */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>SLA Resolution Deadline</span>
              </label>
              <div className="flex items-center gap-1">
                {[24, 48, 72, 168].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleSlaPreset(hours)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      formData.slaHours === String(hours)
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {hours === 168 ? '1wk' : `${hours}h`}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="datetime-local"
              value={formData.slaDeadline}
              onChange={(e) => setFormData({ ...formData, slaDeadline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Before Photo / Incident Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Site Photo Reference (Before Repair URL)</span>
            </label>
            <input
              type="url"
              value={formData.beforeImageUrl}
              onChange={(e) => setFormData({ ...formData, beforeImageUrl: e.target.value })}
              placeholder="https://example.com/site-damage.jpg"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {formData.beforeImageUrl && (
              <div className="mt-2 w-20 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={formData.beforeImageUrl}
                  alt="Incident Reference"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingInitial}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Wrench className="w-4 h-4" />
              <span>{submitting ? 'Generating...' : loadingInitial ? 'Loading...' : 'Generate Work Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkOrderModal;
