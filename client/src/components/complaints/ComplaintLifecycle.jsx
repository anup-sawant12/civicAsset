import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

export function ComplaintLifecycle({ status, closedAt }) {
  if (status === 'REJECTED') {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <strong className="block text-sm font-bold text-white">Complaint Rejected / Cancelled</strong>
            <span>This issue has been closed and removed from the active triage queue.</span>
          </div>
        </div>
        {closedAt && (
          <span className="font-mono text-[11px] text-rose-400">
            {new Date(closedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === status);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-400">Resolution Progress</span>
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold text-[11px]">
          Step {activeIdx + 1} of {LIFECYCLE_STEPS.length}
        </span>
      </div>

      {/* Stepper Grid */}
      <div className="relative grid grid-cols-2 sm:grid-cols-6 gap-2">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                isCurrent
                  ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500'
                  : isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ComplaintLifecycle;
