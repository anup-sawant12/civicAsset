import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, MapPin, Building2 } from 'lucide-react';

// Color definitions for asset statuses
const STATUS_COLORS = {
  OPERATIONAL: {
    bg: '#10b981', // emerald-500
    border: '#059669',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  UNDER_MAINTENANCE: {
    bg: '#f59e0b', // amber-500
    border: '#d97706',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  DAMAGED: {
    bg: '#ef4444', // red-500
    border: '#dc2626',
    text: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  INACTIVE: {
    bg: '#64748b', // slate-500
    border: '#475569',
    text: 'text-slate-400',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  RETIRED: {
    bg: '#8b5cf6', // purple-500
    border: '#7c3aed',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

// SVG symbols for each Asset Type
const TYPE_ICONS = {
  STREETLIGHT: '💡',
  WATER_PIPELINE: '💧',
  TRANSFORMER: '⚡',
  ROAD: '🛣️',
  DRAINAGE: '🌊',
  TRAFFIC_SIGNAL: '🚦',
  PUBLIC_TOILET: '🚻',
  PARK: '🌳',
  GARBAGE_BIN: '🗑️',
  OTHER: '📍',
};

// Create a custom Leaflet DivIcon with pin styling
function createCustomPinIcon(asset, isSelected) {
  const statusConfig = STATUS_COLORS[asset.status] || STATUS_COLORS.OPERATIONAL;
  const isCritical = asset.riskLevel === 'CRITICAL' || asset.condition === 'CRITICAL';
  const typeSymbol = TYPE_ICONS[asset.assetType] || '📍';
  const pulseClass = isCritical ? 'pulse-critical' : '';
  const selectedRing = isSelected ? 'ring-4 ring-cyan-400 scale-110' : '';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 ${selectedRing}">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-sm border-2 ${pulseClass}"
           style="background-color: ${statusConfig.bg}; border-color: ${statusConfig.border}; color: #ffffff;">
        <span>${typeSymbol}</span>
      </div>
      <div class="absolute -bottom-1 w-2 h-2 rotate-45"
           style="background-color: ${statusConfig.border};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-asset-marker-icon',
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
}

export function AssetMarker({ asset, isSelected, onSelect }) {
  const navigate = useNavigate();
  const markerRef = useRef(null);

  // If selected externally (e.g. from search or URL query), open popup automatically
  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  if (!asset.latitude || !asset.longitude || isNaN(asset.latitude) || isNaN(asset.longitude)) {
    return null;
  }

  const icon = createCustomPinIcon(asset, isSelected);
  const statusStyle = STATUS_COLORS[asset.status] || STATUS_COLORS.OPERATIONAL;

  return (
    <Marker
      ref={markerRef}
      position={[asset.latitude, asset.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onSelect) onSelect(asset);
        },
      }}
    >
      <Popup className="custom-asset-popup min-w-[260px] max-w-[320px]">
        <div className="space-y-3 p-1">
          {/* Header */}
          <div className="border-b border-slate-800 pb-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {asset.assetCode}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusStyle.badge}`}>
                {asset.status?.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {asset.name}
            </h3>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {asset.assetType?.toLowerCase().replace('_', ' ')}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
              <span className="block text-[10px] text-slate-500 uppercase font-medium">Condition</span>
              <span className="font-semibold text-slate-200 capitalize">
                {asset.condition?.toLowerCase()}
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
              <span className="block text-[10px] text-slate-500 uppercase font-medium">Risk Level</span>
              <span className={`font-semibold capitalize ${
                asset.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                asset.riskLevel === 'HIGH' ? 'text-amber-400' :
                asset.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
                {asset.riskLevel?.toLowerCase()} ({Math.round(asset.riskScore || 0)})
              </span>
            </div>
          </div>

          {/* Department & Address */}
          <div className="space-y-1.5 text-xs text-slate-400">
            {asset.department && (
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{asset.department.name}</span>
              </div>
            )}
            {asset.address && (
              <div className="flex items-start gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 text-slate-300">{asset.address}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate(`/admin/assets/${asset.id}`)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <span>View Full Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default AssetMarker;
