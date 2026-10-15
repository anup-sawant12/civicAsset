import { Link } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Lightbulb,
  Droplets,
  Zap,
  Navigation,
  Waves,
  TrafficCone,
  Trees,
  Trash,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export function AssetTable({
  assets = [],
  loading = false,
  pagination = {},
  onPageChange,
  onEditAsset,
  onRetireAsset,
  canManage = true,
}) {
  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'STREETLIGHT':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
      case 'WATER_PIPELINE':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'TRANSFORMER':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'ROAD':
        return <Navigation className="w-3.5 h-3.5 text-slate-300" />;
      case 'DRAINAGE':
        return <Waves className="w-3.5 h-3.5 text-blue-400" />;
      case 'TRAFFIC_SIGNAL':
        return <TrafficCone className="w-3.5 h-3.5 text-red-400" />;
      case 'PARK':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'GARBAGE_BIN':
        return <Trash className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        );
      case 'UNDER_MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Maintenance
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Damaged
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Inactive
          </span>
        );
      case 'RETIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 line-through">
            Retired
          </span>
        );
      default:
        return status;
    }
  };

  const getConditionBadge = (cond) => {
    switch (cond) {
      case 'EXCELLENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Excellent
          </span>
        );
      case 'GOOD':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Good
          </span>
        );
      case 'FAIR':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Fair
          </span>
        );
      case 'POOR':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            Poor
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </span>
        );
      default:
        return cond;
    }
  };

  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Low ({score})</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Medium ({score})</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>High ({score})</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical ({score})</span>
          </span>
        );
      default:
        return `${level} (${score})`;
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading municipal assets...</p>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No assets found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No municipal infrastructure items match your filter criteria or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-5 py-3.5">Asset Code / Name</th>
              <th scope="col" className="px-5 py-3.5">Type</th>
              <th scope="col" className="px-5 py-3.5">Department</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5">Condition</th>
              <th scope="col" className="px-5 py-3.5">Risk Score</th>
              <th scope="col" className="px-5 py-3.5">Location</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {assets.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                {/* Code & Name */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {item.assetCode}
                    </span>
                  </div>
                  <div className="font-semibold text-white mt-1 max-w-xs truncate">{item.name}</div>
                </td>

                {/* Type */}
                <td className="px-5 py-4 whitespace-nowrap text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    {getAssetTypeIcon(item.assetType)}
                    <span className="capitalize">{item.assetType.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </td>

                {/* Department */}
                <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-300">
                  {item.department?.name || <span className="text-slate-500 italic">Unassigned</span>}
                </td>

                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>

                {/* Condition */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {getConditionBadge(item.condition)}
                </td>

                {/* Risk */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {getRiskBadge(item.riskLevel, item.riskScore)}
                </td>

                {/* Location */}
                <td className="px-5 py-4 text-xs text-slate-400 max-w-xs">
                  <div className="flex items-center gap-1 text-slate-300 truncate" title={item.address}>
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span className="truncate">{item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/map?assetId=${item.id}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/30 transition-colors"
                      title="View on GIS Map"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/admin/assets/${item.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    {canManage && (
                      <>
                        <button
                          onClick={() => onEditAsset(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title="Edit asset"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {item.status !== 'RETIRED' && (
                          <button
                            onClick={() => onRetireAsset(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                            title="Retire asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-white">{pagination.total}</span> assets
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-200">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetTable;
