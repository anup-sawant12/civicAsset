import { useState, useEffect } from 'react';
import { X, UserCheck, AlertTriangle, Building, Phone } from 'lucide-react';
import userService from '../../services/userService';
import workOrderService from '../../services/workOrderService';

export function AssignWorkerModal({ isOpen, onClose, workOrder, onAssigned }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const res = await userService.getUsers({
        role: 'FIELD_WORKER',
        status: 'ACTIVE',
      });
      setWorkers(res.users || []);
    } catch (err) {
      console.error('Failed to load field workers:', err);
      setError('Unable to load available field workers list.');
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSelectedWorkerId(workOrder?.assignedWorkerId || '');
      fetchWorkers();
    }
  }, [isOpen, workOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setError('Please select a field worker from the list.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await workOrderService.assignWorker(workOrder.id, selectedWorkerId);
      if (res.success) {
        onAssigned(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign field worker.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Highlight workers from matching department
  const matchingDeptWorkers = workers.filter(
    (w) => w.departmentId && w.departmentId === workOrder?.departmentId
  );
  const otherWorkers = workers.filter(
    (w) => !w.departmentId || w.departmentId !== workOrder?.departmentId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Assign Field Worker</h2>
              <p className="text-xs text-slate-400 font-mono">{workOrder?.workOrderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Assigned Department</span>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{workOrder?.department?.name || 'Department Unspecified'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Qualified Field Personnel *
            </label>

            {loadingWorkers ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <div className="inline-block w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                <p>Loading field workers registry...</p>
              </div>
            ) : workers.length === 0 ? (
              <p className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                No active field workers found. Please create or activate field personnel in the Admin console.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {matchingDeptWorkers.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                      ★ Department Field Staff ({matchingDeptWorkers.length})
                    </span>
                    <div className="space-y-1.5">
                      {matchingDeptWorkers.map((w) => (
                        <label
                          key={w.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedWorkerId === w.id
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="workerSelect"
                              value={w.id}
                              checked={selectedWorkerId === w.id}
                              onChange={() => setSelectedWorkerId(w.id)}
                              className="accent-amber-500"
                            />
                            <div>
                              <span className="font-semibold block">{w.firstName} {w.lastName}</span>
                              <span className="text-[10px] text-slate-400">{w.email}</span>
                            </div>
                          </div>
                          {w.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{w.phone}</span>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {otherWorkers.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Other Active Municipal Workers ({otherWorkers.length})
                    </span>
                    <div className="space-y-1.5">
                      {otherWorkers.map((w) => (
                        <label
                          key={w.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedWorkerId === w.id
                              ? 'bg-amber-500/10 border-amber-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="workerSelect"
                              value={w.id}
                              checked={selectedWorkerId === w.id}
                              onChange={() => setSelectedWorkerId(w.id)}
                              className="accent-amber-500"
                            />
                            <div>
                              <span className="font-semibold block">{w.firstName} {w.lastName}</span>
                              <span className="text-[10px] text-slate-400">{w.department?.name || 'General Operations'}</span>
                            </div>
                          </div>
                          {w.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{w.phone}</span>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
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
              disabled={submitting || !selectedWorkerId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{submitting ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignWorkerModal;
