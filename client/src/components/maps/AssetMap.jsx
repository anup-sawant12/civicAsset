import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, AlertCircle, RefreshCw } from 'lucide-react';
import AssetMarker from './AssetMarker';

const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai center
const DEFAULT_ZOOM = 12;

// Sub-component to manage map bounds and center animations
function MapController({ assets, focusedAssetId }) {
  const map = useMap();
  const hasInitialized = useRef(false);

  // If a specific asset is focused (e.g. from search, table click, or query param)
  useEffect(() => {
    if (focusedAssetId && assets.length > 0) {
      const target = assets.find((a) => a.id === focusedAssetId);
      if (target && target.latitude && target.longitude) {
        map.flyTo([target.latitude, target.longitude], 16, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    }
  }, [focusedAssetId, assets, map]);

  // Fit bounds to all assets on initial load or significant asset changes
  useEffect(() => {
    if (!focusedAssetId && assets.length > 0) {
      const validPoints = assets
        .filter((a) => a.latitude && a.longitude && !isNaN(a.latitude) && !isNaN(a.longitude))
        .map((a) => [a.latitude, a.longitude]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        if (bounds.isValid()) {
          // If only 1 point, flyTo, otherwise fitBounds
          if (validPoints.length === 1) {
            map.setView(validPoints[0], 15);
          } else {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          }
          hasInitialized.current = true;
        }
      }
    }
  }, [assets, focusedAssetId, map]);

  return null;
}

// Sub-component to expose the internal Leaflet map instance
function MapInstanceBridge({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export function AssetMap({
  assets = [],
  focusedAssetId = null,
  onAssetSelect = () => {},
  loading = false,
  className = '',
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(focusedAssetId);
  const mapRef = useRef(null);

  useEffect(() => {
    if (focusedAssetId) {
      setSelectedAssetId(focusedAssetId);
    }
  }, [focusedAssetId]);

  // Filter out any assets with invalid or missing coordinates
  const mappedAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.latitude !== null &&
        a.longitude !== null &&
        !isNaN(a.latitude) &&
        !isNaN(a.longitude) &&
        a.latitude >= -90 &&
        a.latitude <= 90 &&
        a.longitude >= -180 &&
        a.longitude <= 180
    );
  }, [assets]);

  const handleSelectAsset = (asset) => {
    setSelectedAssetId(asset.id);
    onAssetSelect(asset);
  };

  const handleResetBounds = () => {
    if (mapRef.current) {
      const map = mapRef.current;
      if (mappedAssets.length > 0) {
        const points = mappedAssets.map((a) => [a.latitude, a.longitude]);
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } else {
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      }
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${className}`}>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-semibold shadow-xl">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Updating Map Markers...</span>
          </div>
        </div>
      )}

      {/* Floating Map Action Controls */}
      <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2">
        <button
          onClick={handleResetBounds}
          title="Fit All Assets in View"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg backdrop-blur-md transition-all cursor-pointer group"
        >
          <Crosshair className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-400" />
        </button>
      </div>

      {/* Empty State Banner if no assets are on the map */}
      {mappedAssets.length === 0 && !loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-medium backdrop-blur-md shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {assets.length === 0
              ? 'No assets found matching selected filters.'
              : `${assets.length} asset(s) found, but none have valid geographic coordinates.`}
          </span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <MapContainer
        ref={mapRef}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-10"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Capture the map instance directly from context */}
        <MapInstanceBridge onMapReady={(map) => { mapRef.current = map; }} />

        <MapController assets={mappedAssets} focusedAssetId={selectedAssetId} />

        {mappedAssets.map((asset) => (
          <AssetMarker
            key={asset.id}
            asset={asset}
            isSelected={selectedAssetId === asset.id}
            onSelect={handleSelectAsset}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default AssetMap;
