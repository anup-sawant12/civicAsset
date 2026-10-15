import { Check, Clock, AlertCircle } from 'lucide-react';

const STEPS = [
  { key: 'CREATED', label: 'Created', timestampKey: 'createdAt' },
  { key: 'ASSIGNED', label: 'Assigned', timestampKey: 'assignedAt' },
  { key: 'IN_PROGRESS', label: 'In Progress', timestampKey: 'startedAt' },
  { key: 'COMPLETED', label: 'Completed', timestampKey: 'completedAt' },
  { key: 'VERIFIED', label: 'Verified', timestampKey: 'verifiedAt' },
  { key: 'CLOSED', label: 'Closed', timestampKey: 'closedAt' },
];

export function WorkOrderTimeline({ workOrder }) {
  if (!workOrder) return null;

  const currentStatus = workOrder.status;

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <strong className="text-sm font-bold text-white">Work Order Cancelled</strong>
        </div>
        <p className="text-xs text-rose-300">
          Reason: {workOrder.rejectionReason || 'No specific cancellation remarks provided.'}
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Work Order Lifecycle Progress
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Stage {currentIndex >= 0 ? currentIndex + 1 : 1} of {STEPS.length}
        </span>
      </div>

      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 sm:gap-2 relative z-10">
          {STEPS.map((step, idx) => {
            const isPassed = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            const timestamp = workOrder[step.timestampKey];

            return (
              <div key={step.key} className="flex flex-col sm:items-center text-left sm:text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md mb-2 ${
                    isPassed
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/20 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-cyan-400 font-bold'
                      : isPassed
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>

                {timestamp && (
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WorkOrderTimeline;
