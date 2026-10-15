import {
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  CheckCheck,
  CheckSquare,
  XCircle,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const STATUS_CONFIGS = {
  CREATED: {
    label: 'Created',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-300',
    icon: Clock,
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    icon: Wrench,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: CheckCircle2,
  },
  VERIFIED: {
    label: 'Verified',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    icon: CheckCheck,
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-700/20',
    border: 'border-slate-700/40',
    text: 'text-slate-400',
    icon: CheckSquare,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    icon: XCircle,
  },
};

export function WorkOrderStatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-slate-400',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}

function calculateSlaStatus(slaDeadline, slaBreached, status) {
  if (!slaDeadline) return { noSla: true };
  const deadlineTime = new Date(slaDeadline).getTime();
  const nowTime = Date.now();
  const isTerminal = ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(status);
  const isBreached = slaBreached || (!isTerminal && nowTime > deadlineTime);
  const diffHours = Math.round((deadlineTime - nowTime) / (1000 * 60 * 60));
  const isUrgent = diffHours <= 12 && diffHours > 0;
  return { noSla: false, isBreached, isUrgent, diffHours, isTerminal };
}

export function WorkOrderSlaBadge({ slaDeadline, slaBreached, status, className = '' }) {
  const { noSla, isBreached, isUrgent, diffHours, isTerminal } = calculateSlaStatus(slaDeadline, slaBreached, status);

  if (noSla) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/60 border border-slate-700/60 text-slate-400 ${className}`}>
        <span>No SLA Set</span>
      </span>
    );
  }

  if (isBreached) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 ${className}`}
      >
        <AlertTriangle className="w-3 h-3" />
        <span>SLA BREACHED</span>
      </span>
    );
  }

  if (isUrgent && !isTerminal) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 ${className}`}
      >
        <Clock className="w-3 h-3" />
        <span>Due Soon ({diffHours}h)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ${className}`}
    >
      <ShieldCheck className="w-3 h-3" />
      <span>Within SLA</span>
    </span>
  );
}

export default WorkOrderStatusBadge;
