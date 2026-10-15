import { useState, useEffect } from 'react';
import { X, MapPin, AlertCircle, Compass } from 'lucide-react';
import LocationPicker from '../maps/LocationPicker';

const ASSET_TYPES = [
  { value: 'STREETLIGHT', label: 'Streetlight' },
  { value: 'WATER_PIPELINE', label: 'Water Pipeline' },
  { value: 'TRANSFORMER', label: 'Electrical Transformer' },
  { value: 'ROAD', label: 'Roadway' },
  { value: 'DRAINAGE', label: 'Drainage Network' },
  { value: 'TRAFFIC_SIGNAL', label: 'Traffic Signal' },
  { value: 'PUBLIC_TOILET', label: 'Public Restroom' },
  { value: 'PARK', label: 'Civic Park & Garden' },
  { value: 'GARBAGE_BIN', label: 'Waste Collection Bin' },
  { value: 'OTHER', label: 'Other Infrastructure' },
];

const ASSET_STATUSES = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'RETIRED', label: 'Retired / Archived' },
];

const ASSET_CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'CRITICAL', label: 'Critical' },
];

const RISK_LEVELS = [
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk' },
  { value: 'CRITICAL', label: 'Critical Risk' },
];

export function AssetForm({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  asset = null,
  departments = [],
  onSubmit,
  onClose,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    assetType: 'STREETLIGHT',
    description: '',
    departmentId: '',
    status: 'OPERATIONAL',
    condition: 'GOOD',
    latitude: '',
    longitude: '',
    address: '',
    installationDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    riskScore: 0,
    riskLevel: 'LOW',
  });

  const [error, setError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Format date for <input type="date" />
  const formatDateInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (mode === 'edit' && asset) {
      setFormData({
        assetCode: asset.assetCode || '',
        name: asset.name || '',
        assetType: asset.assetType || 'STREETLIGHT',
        description: asset.description || '',
        departmentId: asset.departmentId || '',
        status: asset.status || 'OPERATIONAL',
        condition: asset.condition || 'GOOD',
        latitude: asset.latitude !== undefined ? String(asset.latitude) : '',
        longitude: asset.longitude !== undefined ? String(asset.longitude) : '',
        address: asset.address || '',
        installationDate: formatDateInput(asset.installationDate),
        lastMaintenance: formatDateInput(asset.lastMaintenance),
        nextMaintenance: formatDateInput(asset.nextMaintenance),
        riskScore: asset.riskScore ?? 0,
        riskLevel: asset.riskLevel || 'LOW',
      });
    } else {
      setFormData({
        assetCode: '',
        name: '',
        assetType: 'STREETLIGHT',
        description: '',
        departmentId: departments[0]?.id || '',
        status: 'OPERATIONAL',
        condition: 'GOOD',
        latitude: '19.0760',
        longitude: '72.8777',
        address: '',
        installationDate: new Date().toISOString().split('T')[0],
        lastMaintenance: '',
        nextMaintenance: '',
        riskScore: 10,
        riskLevel: 'LOW',
      });
    }
    setError('');
  }, [mode, asset, departments, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto calculate risk level recommendation based on risk score
      if (name === 'riskScore') {
        const num = parseFloat(value) || 0;
        if (num <= 25) updated.riskLevel = 'LOW';
        else if (num <= 50) updated.riskLevel = 'MEDIUM';
        else if (num <= 75) updated.riskLevel = 'HIGH';
        else updated.riskLevel = 'CRITICAL';
      }

      return updated;
    });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.assetCode.trim()) {
      setError('Asset code is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Asset name is required');
      return;
    }
    if (!formData.departmentId) {
      setError('Please select an administrative department');
      return;
    }

    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a valid number between -90 and 90');
      return;
    }

    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude must be a valid number between -180 and 180');
      return;
    }

    const score = parseFloat(formData.riskScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setError('Risk score must be between 0 and 100');
      return;
    }

    onSubmit({
      ...formData,
      assetCode: formData.assetCode.trim().toUpperCase(),
      name: formData.name.trim(),
      latitude: lat,
      longitude: lng,
      riskScore: score,
      installationDate: formData.installationDate || null,
      lastMaintenance: formData.lastMaintenance || null,
      nextMaintenance: formData.nextMaintenance || null,
      description: formData.description.trim() || null,
      address: formData.address.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 my-8">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Register Municipal Asset' : 'Edit Infrastructure Asset'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'create'
              ? 'Catalog a new physical civic infrastructure item with GIS coordinates and lifecycle parameters'
              : `Updating parameters for ${asset?.assetCode} — ${asset?.name}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Asset Code *
              </label>
              <input
                type="text"
                name="assetCode"
                required
                value={formData.assetCode}
                onChange={handleChange}
                placeholder="STL-1042"
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="MG Road LED Streetlight 42"
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Infrastructure Type *
              </label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Department *
              </label>
              <select
                name="departmentId"
                required
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Select Department...</option>
                {departments
                  .filter((d) => d.isActive || d.id === formData.departmentId)
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {!dept.isActive ? '(Inactive)' : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Status & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Operational Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Physical Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {ASSET_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coordinates (GIS) & Address */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                GIS Coordinates & Location
              </span>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  showMapPicker
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showMapPicker ? 'Hide Map Picker' : 'Select Location on Map'}</span>
              </button>
            </div>

            {/* Interactive Location Picker */}
            {showMapPicker && (
              <div className="p-3 bg-slate-950/60 border border-cyan-500/30 rounded-xl space-y-2">
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  height="260px"
                  onLocationSelect={({ latitude, longitude }) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: latitude.toString(),
                      longitude: longitude.toString(),
                    }));
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Latitude (-90 to 90) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="19.0760"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Longitude (-180 to 180) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="72.8777"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Physical Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="MG Road, Junction 4"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Dates: Installation, Last Maintenance, Next Maintenance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Installation Date
              </label>
              <input
                type="date"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Last Maintenance
              </label>
              <input
                type="date"
                name="lastMaintenance"
                value={formData.lastMaintenance}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Next Maintenance
              </label>
              <input
                type="date"
                name="nextMaintenance"
                value={formData.nextMaintenance}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Risk Score & Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Risk Score (0–100)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">{formData.riskScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                name="riskScore"
                value={formData.riskScore}
                onChange={handleChange}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Risk Classification Level *
              </label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Technical Description / Notes
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Model specification, manufacturer, serial ID, feeder connection..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Register Asset' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetForm;
