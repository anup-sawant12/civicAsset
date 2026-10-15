import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai

// Custom picker pin icon
function createPickerPinIcon() {
  const html = `
    <div class="relative flex items-center justify-center cursor-pointer">
      <div class="w-9 h-9 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div class="absolute -bottom-1.5 w-3 h-3 bg-white rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-picker-pin',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
  });
}

// Sub-component to handle map clicks and marker updates
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
      });
    },
  });
  return null;
}

// Sub-component to pan map when coordinates change
function RecenterController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom() < 14 ? 15 : map.getZoom());
    }
  }, [position, map]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
  height = '350px',
  label = 'Select Asset Location on Map',
}) {
  const [selectedPos, setSelectedPos] = useState(
    latitude && longitude && !isNaN(latitude) && !isNaN(longitude)
      ? [parseFloat(latitude), parseFloat(longitude)]
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      setSelectedPos([parseFloat(latitude), parseFloat(longitude)]);
    } else {
      setSelectedPos(null);
    }
  }, [latitude, longitude]);

  const handleCoordinateSelect = ({ latitude: newLat, longitude: newLng }) => {
    setSelectedPos([newLat, newLng]);
    setGeoError(null);
    if (onLocationSelect) {
      onLocationSelect({
        latitude: newLat,
        longitude: newLng,
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLng = parseFloat(pos.coords.longitude.toFixed(6));
        handleCoordinateSelect({ latitude: newLat, longitude: newLng });
      },
      (err) => {
        setIsLocating(false);
        setGeoError('Unable to retrieve your current location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const initialCenter = selectedPos || DEFAULT_CENTER;
  const pinIcon = createPickerPinIcon();

  return (
    <div className="space-y-2">
      {/* Top Bar with Instructions & Current Value */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">{label}</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">(Click map to pin)</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedPos ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
              <Check className="w-3 h-3 text-cyan-400" />
              <span>{selectedPos[0].toFixed(5)}, {selectedPos[1].toFixed(5)}</span>
            </div>
          ) : (
            <span className="text-amber-400/90 text-[11px] italic">No coordinates pinned</span>
          )}

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-[11px] disabled:opacity-50"
            title="Use current GPS location"
          >
            <Navigation className={`w-3 h-3 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {geoError && (
        <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner relative"
        style={{ height }}
      >
        <MapContainer
          center={initialCenter}
          zoom={selectedPos ? 15 : 12}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onSelect={handleCoordinateSelect} />
          {selectedPos && <RecenterController position={selectedPos} />}

          {selectedPos && (
            <Marker
              position={selectedPos}
              icon={pinIcon}
              draggable={true}
              eventHandlers={{
                dragend(e) {
                  const marker = e.target;
                  const { lat, lng } = marker.getLatLng();
                  handleCoordinateSelect({
                    latitude: parseFloat(lat.toFixed(6)),
                    longitude: parseFloat(lng.toFixed(6)),
                  });
                },
              }}
            />
          )}
        </MapContainer>

        {/* Floating guidance overlay */}
        <div className="absolute bottom-2 left-2 z-[999] pointer-events-none px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[10px] text-slate-400">
          💡 Click or drag pin to position asset
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;
