import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Markers
const assetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const complaintIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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

// Component to handle map clicks for coordinate picking
function MapClickHandler({ isPickingCoords, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isPickingCoords && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function AssetMap({ 
  assets = [], 
  complaints = [], 
  selectedAsset, 
  selectedComplaint, 
  onSelectAsset, 
  onSelectComplaint, 
  mapCenter,
  mode = 'assets',
  isPickingCoords = false,
  onMapClick
}) {
  const defaultCenter = [19.0760, 72.8777]; // Mumbai
  
  // Ensure we have valid center coordinates
  const centerPosition = mapCenter && !isNaN(mapCenter[0]) && !isNaN(mapCenter[1]) 
    ? mapCenter 
    : defaultCenter;

  return (
    <div className={`w-full h-full relative z-0 animate-fade-in ${isPickingCoords ? 'cursor-crosshair' : ''}`}>
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
        <MapClickHandler isPickingCoords={isPickingCoords} onMapClick={onMapClick} />

        {/* Render Asset Markers */}
        {assets.map((asset) => {
          const lat = parseFloat(asset.latitude);
          const lng = parseFloat(asset.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={asset.id} 
              position={[lat, lng]}
              icon={assetIcon}
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

        {/* Render Complaint Markers */}
        {mode === 'complaints' && complaints.map((complaint) => {
          const lat = parseFloat(complaint.latitude);
          const lng = parseFloat(complaint.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={complaint.id} 
              position={[lat, lng]}
              icon={complaintIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectComplaint) {
                    onSelectComplaint(complaint);
                  }
                }
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 min-w-[160px]">
                  <span className="text-[10px] font-bold font-mono text-red-600 block uppercase mb-0.5">{complaint.id}</span>
                  <h4 className="font-bold text-sm mb-1 text-slate-800 leading-tight">{complaint.category}</h4>
                  <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                    <p className="italic text-slate-500 mb-1 truncate">"{complaint.description}"</p>
                    <div>Severity: <span className="font-semibold text-slate-800">{complaint.severity}</span></div>
                    <div>Status: <span className="font-semibold text-slate-800">{complaint.status.replace('_', ' ')}</span></div>
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
