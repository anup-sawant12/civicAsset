import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import AssetMap from '../../components/maps/AssetMap';
import MapFilters from '../../components/maps/MapFilters';
import MapLegend from '../../components/maps/MapLegend';
import assetService from '../../services/assetService';
import departmentService from '../../services/departmentService';
import {
  MapPin,
  Layers,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Plus,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export function AssetMapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const focusedAssetId = searchParams.get('assetId');

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    mapped: 0,
    unmapped: 0,
    critical: 0,
    underMaintenance: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    assetType: '',
    status: '',
    condition: '',
    riskLevel: '',
    departmentId: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch departments list for filtering
  useEffect(() => {
    let isMounted = true;
    async function loadDepartments() {
      try {
        const res = await departmentService.getDepartments({ limit: 100 });
        if (isMounted && res.success) {
          setDepartments(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load departments for map filter:', err);
      }
    }
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch lightweight asset data for map
  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assetService.getMapAssets(filters);
      if (res.success) {
        setAssets(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch map assets:', err);
      setError(err.response?.data?.message || 'Failed to load GIS asset data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      assetType: '',
      status: '',
      condition: '',
      riskLevel: '',
      departmentId: '',
    });
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'OFFICER';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Top Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Geographic Information System
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-cyan-400" />
              Municipal Infrastructure GIS Map
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live spatial asset distribution, risk monitoring, operational statuses, and coordinates across municipal sectors.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {canManage && (
              <button
                onClick={() => navigate('/admin/assets?action=create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-lg shadow-cyan-900/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Asset</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Total Filtered</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Mapped On GIS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats.mapped}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Critical Risk</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1">{stats.critical}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Maintenance</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats.underMaintenance}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Without Location</span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-300 mt-1">{stats.unmapped}</div>
          </div>
        </div>

        {/* Filters Bar */}
        <MapFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          departments={departments}
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchMapData}
              className="text-xs font-semibold underline hover:text-red-300 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Map Canvas and Legend Layout */}
        <div className="relative">
          <AssetMap
            assets={assets}
            focusedAssetId={focusedAssetId}
            loading={loading}
            className="h-[600px] w-full"
          />

          {/* Floating Legend Overlay at Bottom-Left */}
          <div className="absolute bottom-4 left-4 z-[999]">
            <MapLegend />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssetMapPage;
