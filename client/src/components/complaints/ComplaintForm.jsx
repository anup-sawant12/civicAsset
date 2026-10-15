import { useState, useEffect } from 'react';
import {
  AlertCircle,
  MapPin,
  Camera,
  Layers,
  Compass,
  CheckCircle,
} from 'lucide-react';
import LocationPicker from '../maps/LocationPicker';
import assetService from '../../services/assetService';

const CATEGORIES = [
  { value: 'STREETLIGHT', label: 'Streetlight Fault', icon: '💡' },
  { value: 'ROAD', label: 'Pothole / Road Damage', icon: '🛣️' },
  { value: 'WATER', label: 'Water Leakage / Pipe Burst', icon: '💧' },
  { value: 'DRAINAGE', label: 'Clogged Drainage / Overflow', icon: '🌊' },
  { value: 'GARBAGE', label: 'Waste Accumulation', icon: '🗑️' },
  { value: 'TRAFFIC_SIGNAL', label: 'Traffic Signal Failure', icon: '🚦' },
  { value: 'ELECTRICITY', label: 'Exposed Wire / Transformer', icon: '⚡' },
  { value: 'PUBLIC_TOILET', label: 'Public Restroom Hygiene', icon: '🚻' },
  { value: 'PARK', label: 'Park Maintenance', icon: '🌳' },
  { value: 'OTHER', label: 'Other Civic Infrastructure', icon: '📍' },
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', desc: 'Minor cosmetic issue, no immediate risk' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Standard service disruption' },
  { value: 'HIGH', label: 'High', desc: 'Significant hazard or major traffic block' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Immediate public danger / life hazard' },
];

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'Streetlight', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80' },
  { label: 'Road Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
];

export function ComplaintForm({
  onSubmit,
  loading = false,
  initialData = {},
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    category: initialData.category || 'STREETLIGHT',
    description: initialData.description || '',
    severity: initialData.severity || 'MEDIUM',
    latitude: initialData.latitude || 19.0760,
    longitude: initialData.longitude || 72.8777,
    address: initialData.address || '',
    assetId: initialData.assetId || '',
    imageUrl: initialData.imageUrl || '',
  });

  const [availableAssets, setAvailableAssets] = useState([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [error, setError] = useState('');

  // Fetch candidate assets for linking
  useEffect(() => {
    let isMounted = true;
    async function loadAssets() {
      try {
        const res = await assetService.getAssets({ limit: 50 });
        if (isMounted && res.success) {
          setAvailableAssets(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load assets for complaint linking:', err);
      }
    }
    loadAssets();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleSelectAsset = (asset) => {
    if (asset) {
      setFormData((prev) => ({
        ...prev,
        assetId: asset.id,
        // Auto-fill address and coords from asset if currently empty
        latitude: asset.latitude || prev.latitude,
        longitude: asset.longitude || prev.longitude,
        address: prev.address || asset.address || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, assetId: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category for this complaint.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a detailed description of the civic problem.');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      setError('Please provide valid geographic coordinates.');
      return;
    }

    onSubmit({
      ...formData,
      latitude: lat,
      longitude: lng,
      description: formData.description.trim(),
      address: formData.address.trim() || null,
      assetId: formData.assetId || null,
      imageUrl: formData.imageUrl.trim() || null,
    });
  };

  const selectedAssetObj = availableAssets.find((a) => a.id === formData.assetId);

  const filteredAssets = availableAssets.filter((a) => {
    if (!assetSearch) return true;
    const q = assetSearch.toLowerCase();
    return (
      a.assetCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.assetType.toLowerCase().includes(q)
    );
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Issue Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CATEGORIES.map((c) => {
            const isSelected = formData.category === c.value;
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => setFormData((prev) => ({ ...prev, category: c.value }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="text-xl mb-1">{c.icon}</span>
                <span className="text-xs font-semibold leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          2. Detailed Description *
        </label>
        <textarea
          name="description"
          rows={3}
          required
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the defect, visible damages, hazards, or recent incidents..."
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 leading-relaxed"
        />
      </div>

      {/* 3. Severity Level */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          3. Perceived Severity *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {SEVERITY_LEVELS.map((s) => {
            const isSelected = formData.severity === s.value;
            return (
              <button
                type="button"
                key={s.value}
                onClick={() => setFormData((prev) => ({ ...prev, severity: s.value }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? s.value === 'CRITICAL'
                      ? 'bg-rose-500/20 border-rose-500 text-white ring-1 ring-rose-500'
                      : s.value === 'HIGH'
                      ? 'bg-orange-500/20 border-orange-500 text-white ring-1 ring-orange-500'
                      : 'bg-cyan-500/20 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="block text-xs font-bold uppercase">{s.label}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5 leading-snug">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Link to Known Municipal Asset (Optional) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              4. Link to Registered Asset (Optional)
            </span>
          </div>
          {selectedAssetObj && (
            <button
              type="button"
              onClick={() => handleSelectAsset(null)}
              className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
            >
              Clear Selected Asset
            </button>
          )}
        </div>

        {selectedAssetObj ? (
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-400">{selectedAssetObj.assetCode}</span>
              <p className="text-sm font-semibold text-white mt-0.5">{selectedAssetObj.name}</p>
              <p className="text-xs text-slate-400">{selectedAssetObj.department?.name || 'Municipal Sector'}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search existing streetlight, pipeline or transformer..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-slate-950/40">
              {filteredAssets.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  onClick={() => handleSelectAsset(a)}
                  className="p-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="truncate">
                    <span className="font-mono font-bold text-cyan-400 mr-2">{a.assetCode}</span>
                    <span className="text-white truncate">{a.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">{a.assetType}</span>
                </div>
              ))}
              {filteredAssets.length === 0 && (
                <p className="p-3 text-center text-xs text-slate-500">No matching assets found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Geographic Location */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              5. Incident Location *
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showLocationPicker ? 'Hide Map Picker' : 'Select on GIS Map'}</span>
          </button>
        </div>

        {showLocationPicker && (
          <div className="p-3 bg-slate-950/60 border border-cyan-500/30 rounded-xl">
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              height="280px"
              onLocationSelect={handleLocationSelect}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Street Address / Landmark</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Near Junction 4, Opposite General Hospital"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Coordinates</label>
            <div className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 truncate">
              {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Photo Evidence */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            6. Photo Evidence (Optional)
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Photo Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/evidence-photo.jpg"
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Demo Quick Photos */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500">Quick Demo Evidence:</span>
          {SAMPLE_EVIDENCE_PHOTOS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => setFormData((prev) => ({ ...prev, imageUrl: p.url }))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
            >
              + {p.label}
            </button>
          ))}
          {formData.imageUrl && (
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
              className="text-[11px] text-rose-400 hover:underline cursor-pointer ml-auto"
            >
              Remove Photo
            </button>
          )}
        </div>

        {/* Preview */}
        {formData.imageUrl && (
          <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden border border-slate-700 shadow-md">
            <img
              src={formData.imageUrl}
              alt="Evidence preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting Report...' : isEdit ? 'Save Changes' : 'Submit Official Complaint'}
        </button>
      </div>
    </form>
  );
}

export default ComplaintForm;
