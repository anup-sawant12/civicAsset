export function ComplaintStatusBadge({ status }) {
  const styles = {
    SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    UNDER_REVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    ASSIGNED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    VERIFIED: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const style = styles[status] || styles.SUBMITTED;
  const label = (status || 'SUBMITTED').replace('_', ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${style}`}>
      {label}
    </span>
  );
}

export function ComplaintSeverityBadge({ severity }) {
  const styles = {
    LOW: 'bg-slate-500/10 text-slate-300 border-slate-700',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
  };

  const style = styles[severity] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      {severity || 'MEDIUM'}
    </span>
  );
}

export function ComplaintPriorityBadge({ priority }) {
  const styles = {
    LOW: 'bg-slate-800 text-slate-400 border-slate-700',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/30 font-bold',
  };

  const style = styles[priority] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style}`}>
      {priority || 'MEDIUM'}
    </span>
  );
}
