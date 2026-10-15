import { Link } from 'react-router-dom';
import {
  ComplaintStatusBadge,
  ComplaintSeverityBadge,
  ComplaintPriorityBadge,
} from './ComplaintBadges';
import {
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Building,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  STREETLIGHT: '💡',
  ROAD: '🛣️',
  WATER: '💧',
  DRAINAGE: '🌊',
  GARBAGE: '🗑️',
  TRAFFIC_SIGNAL: '🚦',
  ELECTRICITY: '⚡',
  PUBLIC_TOILET: '🚻',
  PARK: '🌳',
  OTHER: '📍',
};

export function ComplaintTable({
  complaints = [],
  loading = false,
  pagination = {},
  onPageChange = () => {},
  detailsBasePath = '/admin/complaints',
  emptyMessage = 'No complaints found',
}) {
  if (loading) {
    return (
      <div className="w-full p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
        <div className="inline-block w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-medium">Loading municipal complaints...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="w-full p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{emptyMessage}</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No civic issues currently recorded under these search criteria.
        </p>
      </div>
    );
  }

  const { page = 1, total = 0, totalPages = 1 } = pagination;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col justify-between">
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-5 py-3.5">Complaint Code</th>
              <th scope="col" className="px-5 py-3.5">Category</th>
              <th scope="col" className="px-5 py-3.5">Description</th>
              <th scope="col" className="px-5 py-3.5">Severity / Priority</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5">Department / Asset</th>
              <th scope="col" className="px-5 py-3.5">Date</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {complaints.map((item) => {
              const icon = CATEGORY_ICONS[item.category] || '📍';
              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Code */}
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-cyan-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {item.complaintCode}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                      <span>{icon}</span>
                      <span className="capitalize">{item.category?.toLowerCase().replace('_', ' ')}</span>
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-5 py-4 max-w-xs">
                    <div className="truncate text-xs font-medium text-slate-200" title={item.description}>
                      {item.description}
                    </div>
                    {item.address && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5" title={item.address}>
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>
                    )}
                  </td>

                  {/* Severity / Priority */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <ComplaintSeverityBadge severity={item.severity} />
                      <ComplaintPriorityBadge priority={item.priority} />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <ComplaintStatusBadge status={item.status} />
                  </td>

                  {/* Department & Asset */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.department?.name || 'Unassigned'}</span>
                    </div>
                    {item.asset && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                        <Layers className="w-3 h-3 shrink-0" />
                        <span className="truncate font-mono">{item.asset.assetCode} — {item.asset.name}</span>
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                    <Link
                      to={`${detailsBasePath}/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {complaints.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {item.complaintCode}
              </span>
              <ComplaintStatusBadge status={item.status} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">{CATEGORY_ICONS[item.category] || '📍'}</span>
              <span className="text-xs font-bold text-white uppercase">{item.category}</span>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-2 pt-1">
              <ComplaintSeverityBadge severity={item.severity} />
              <ComplaintPriorityBadge priority={item.priority} />
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">{new Date(item.submittedAt).toLocaleDateString()}</span>
              <Link
                to={`${detailsBasePath}/${item.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
              >
                <span>View Details →</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{(page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(page * pagination.limit, total)}</strong> of{' '}
            <strong className="text-white">{total}</strong> complaints
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintTable;
