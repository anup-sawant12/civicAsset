import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function createComplaintMarkerIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
        ⚠️
      </div>
      <div class="absolute -bottom-1 w-2 h-2 bg-white rotate-45"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-complaint-pin',
    iconSize: [32, 36],
    iconAnchor: [16, 36],
  });
}

function createAssetMarkerIcon() {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs">
        📍
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

export function ComplaintMapCard({
  latitude,
  longitude,
  address,
  complaintCode,
  asset,
  height = '260px',
}) {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
        <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-600" />
        <span>No geographic coordinates recorded for this incident.</span>
      </div>
    );
  }

  const center = [latitude, longitude];
  const complaintIcon = createComplaintMarkerIcon();
  const assetIcon = createAssetMarkerIcon();

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Incident Location</span>
        </div>
        <Link
          to={`/admin/map?lat=${latitude}&lng=${longitude}`}
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
          <Marker position={center} icon={complaintIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-cyan-400">{complaintCode}</span>
                <p className="text-slate-200">{address || 'Incident Pin'}</p>
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

      {address && (
        <div className="flex items-start gap-1.5 text-xs text-slate-300 pt-1">
          <Navigation className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span className="font-medium text-slate-200">{address}</span>
        </div>
      )}
    </div>
  );
}

export default ComplaintMapCard;
