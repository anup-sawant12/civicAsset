import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const statuses = [
    { label: 'Operational', color: '#10b981', desc: 'Asset functional & active' },
    { label: 'Under Maintenance', color: '#f59e0b', desc: 'Active repair or overhaul' },
    { label: 'Damaged', color: '#ef4444', desc: 'Hardware fault / degraded' },
    { label: 'Inactive', color: '#64748b', desc: 'Temporarily disabled' },
    { label: 'Retired', color: '#8b5cf6', desc: 'Decommissioned archive' },
  ];

  const types = [
    { label: 'Streetlight', icon: '💡' },
    { label: 'Water Pipeline', icon: '💧' },
    { label: 'Transformer', icon: '⚡' },
    { label: 'Road', icon: '🛣️' },
    { label: 'Drainage', icon: '🌊' },
    { label: 'Traffic Signal', icon: '🚦' },
    { label: 'Public Toilet', icon: '🚻' },
    { label: 'Park', icon: '🌳' },
    { label: 'Garbage Bin', icon: '🗑️' },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-3 text-xs text-slate-200 transition-all max-w-xs">
      <div
        className="flex items-center justify-between cursor-pointer gap-3 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 font-semibold text-white">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Map Legend</span>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
          aria-label="Toggle legend details"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Statuses (Always visible) */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-slate-800/80">
        {statuses.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-slate-300 truncate">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 col-span-2 mt-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="text-[11px] text-rose-300 font-medium">Pulsing = Critical Risk Asset</span>
        </div>
      </div>

      {/* Expandable Asset Types */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Infrastructure Types
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {types.map((t) => (
              <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="text-xs">{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapLegend;
