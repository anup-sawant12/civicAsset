import { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';

const ASSET_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'STREETLIGHT', label: 'Streetlight' },
  { value: 'WATER_PIPELINE', label: 'Water Pipeline' },
  { value: 'TRANSFORMER', label: 'Transformer' },
  { value: 'ROAD', label: 'Road' },
  { value: 'DRAINAGE', label: 'Drainage' },
  { value: 'TRAFFIC_SIGNAL', label: 'Traffic Signal' },
  { value: 'PUBLIC_TOILET', label: 'Public Toilet' },
  { value: 'PARK', label: 'Park' },
  { value: 'GARBAGE_BIN', label: 'Garbage Bin' },
  { value: 'OTHER', label: 'Other Infrastructure' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'RETIRED', label: 'Retired' },
];

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'CRITICAL', label: 'Critical' },
];

const RISK_LEVELS = [
  { value: '', label: 'All Risk Levels' },
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk' },
  { value: 'CRITICAL', label: 'Critical Risk' },
];

export function MapFilters({
  filters,
  onFilterChange,
  onResetFilters,
  departments = [],
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync internal search input with external filters
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Debounced search (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange('search', searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const activeFilterCount = [
    filters.assetType,
    filters.status,
    filters.condition,
    filters.riskLevel,
    filters.departmentId,
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Top Search & Primary Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code, name, or street address..."
            className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onFilterChange('search', '');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Asset Type */}
          <select
            value={filters.assetType || ''}
            onChange={(e) => onFilterChange('assetType', e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-900 text-slate-200">
                {t.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-900 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              activeFilterCount > 0 || showAdvanced
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5" />
            )}
          </button>

          {/* Reset Filters */}
          {(activeFilterCount > 0 || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                onResetFilters();
              }}
              title="Reset all filters"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Expandable Row */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Department</label>
            <select
              value={filters.departmentId || ''}
              onChange={(e) => onFilterChange('departmentId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id} className="bg-slate-900 text-slate-200">
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Physical Condition</label>
            <select
              value={filters.condition || ''}
              onChange={(e) => onFilterChange('condition', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value} className="bg-slate-900 text-slate-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Risk Severity</label>
            <select
              value={filters.riskLevel || ''}
              onChange={(e) => onFilterChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-900 text-slate-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapFilters;
