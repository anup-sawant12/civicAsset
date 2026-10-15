import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function createWorkOrderMarkerIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
        🔧
      </div>
      <div class="absolute -bottom-1 w-2 h-2 bg-white rotate-45"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-wo-pin',
    iconSize: [32, 36],
    iconAnchor: [16, 36],
  });
}

function createAssetMarkerIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
        🏢
      </div>
      <div class="absolute -bottom-1 w-2 h-2 bg-white rotate-45"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-asset-pin',
    iconSize: [28, 32],
    iconAnchor: [14, 32],
  });
}

export function WorkOrderMapCard({
  latitude,
  longitude,
  address,
  workOrderCode,
  asset,
  height = '260px',
}) {
  const lat = latitude || asset?.latitude;
  const lng = longitude || asset?.longitude;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
        <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-600" />
        <span>No geographic coordinates registered for this work site.</span>
      </div>
    );
  }

  const center = [lat, lng];
  const woIcon = createWorkOrderMarkerIcon();
  const assetIcon = createAssetMarkerIcon();

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Work Order Coordinates & GIS Site</span>
        </div>
        <Link
          to={`/admin/map?lat=${lat}&lng=${lng}`}
          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <span>Open Full GIS Map</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="w-full rounded-xl overflow-hidden border border-slate-800" style={{ height }}>
        <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="w-full h-full z-10">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={woIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-cyan-400">{workOrderCode}</span>
                <p className="text-slate-200">{address || 'Work Order Pin'}</p>
              </div>
            </Popup>
          </Marker>

          {asset && asset.latitude && asset.longitude && (
            <Marker position={[asset.latitude, asset.longitude]} icon={assetIcon}>
              <Popup>
                <div className="text-xs space-y-1">
                  <span className="font-mono font-bold text-emerald-400">{asset.assetCode}</span>
                  <p className="text-white font-medium">{asset.name}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
        {address ? (
          <div className="flex items-start gap-1.5 text-slate-300">
            <Navigation className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span className="font-medium text-slate-200">{address}</span>
          </div>
        ) : (
          <span className="text-slate-500">Site coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
        )}

        <div className="font-mono text-[11px] text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 self-start sm:self-auto">
          {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
        </div>
      </div>
    </div>
  );
}

export default WorkOrderMapCard;
