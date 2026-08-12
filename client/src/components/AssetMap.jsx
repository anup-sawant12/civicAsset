import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically pan/zoom map to selected coordinates
function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function AssetMap({ assets, selectedAsset, onSelectAsset, mapCenter }) {
  const defaultCenter = [19.0760, 72.8777]; // Mumbai
  
  // Ensure we have valid center coordinates
  const centerPosition = mapCenter && !isNaN(mapCenter[0]) && !isNaN(mapCenter[1]) 
    ? mapCenter 
    : defaultCenter;

  return (
    <div className="w-full h-full relative z-0 animate-fade-in">
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeMapCenter center={centerPosition} />

        {assets.map((asset) => {
          const lat = parseFloat(asset.latitude);
          const lng = parseFloat(asset.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={asset.id} 
              position={[lat, lng]}
              eventHandlers={{
                click: () => {
                  if (onSelectAsset) {
                    onSelectAsset(asset);
                  }
                }
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 min-w-[160px]">
                  <span className="text-[10px] font-bold font-mono text-indigo-600 block uppercase mb-0.5">{asset.id}</span>
                  <h4 className="font-bold text-sm mb-1 text-slate-800 leading-tight">{asset.name}</h4>
                  <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                    <div>Type: <span className="font-semibold text-slate-800">{asset.assetType}</span></div>
                    <div>Status: <span className="font-semibold text-slate-800">{asset.status.replace('_', ' ')}</span></div>
                    <div>Condition: <span className="font-semibold text-slate-800">{asset.condition}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
