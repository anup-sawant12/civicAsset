import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import assetService from '../../services/assetService';
import departmentService from '../../services/departmentService';
import AdminHeader from '../../components/admin/AdminHeader';
import AssetTable from '../../components/assets/AssetTable';
import AssetForm from '../../components/assets/AssetForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Plus, Search, RotateCcw, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

export function Assets() {
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const canManage = role === 'ADMIN' || role === 'OFFICER';

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    assetType: '',
    departmentId: '',
    status: '',
    condition: '',
    riskLevel: '',
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Retirement confirmation state
  const [retireModal, setRetireModal] = useState({
    isOpen: false,
    asset: null,
  });

  // Feedback notifications
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Load departments for filter dropdown & form
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  }, []);

  // Load assets with filters and pagination
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.assetType) params.assetType = filters.assetType;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.status) params.status = filters.status;
      if (filters.condition) params.condition = filters.condition;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;

      const res = await assetService.getAssets(params);
      if (res.success) {
        setAssets(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load assets';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAssets]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      assetType: '',
      departmentId: '',
      status: '',
      condition: '',
      riskLevel: '',
    });
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  // If redirected with ?action=create from GIS map or elsewhere
  useEffect(() => {
    if (searchParams.get('action') === 'create' && canManage) {
      handleOpenCreate();
    }
  }, [searchParams, canManage]);

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setFormMode('edit');
    setSelectedAsset(item);
    setIsFormOpen(true);
  };

  // Submit Create or Edit
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (formMode === 'create') {
        const res = await assetService.createAsset(formData);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Asset ${res.data.assetCode} — "${res.data.name}" cataloged successfully.`,
          });
          setIsFormOpen(false);
          fetchAssets();
        }
      } else {
        const res = await assetService.updateAsset(selectedAsset.id, formData);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: `Asset ${res.data.assetCode} updated successfully.`,
          });
          setIsFormOpen(false);
          fetchAssets();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save asset';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Prompt Retire
  const handlePromptRetire = (item) => {
    setRetireModal({
      isOpen: true,
      asset: item,
    });
  };

  // Confirm Retire
  const handleConfirmRetire = async () => {
    const { asset } = retireModal;
    if (!asset) return;

    try {
      const res = await assetService.retireAsset(asset.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Asset ${asset.assetCode} has been safely retired and archived.`,
        });
        fetchAssets();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retire asset';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setRetireModal({ isOpen: false, asset: null });
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.assetType ||
    filters.departmentId ||
    filters.status ||
    filters.condition ||
    filters.riskLevel;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="assets" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">Municipal Assets</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {pagination.total} {pagination.total === 1 ? 'Asset' : 'Assets'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              GIS-located infrastructure lifecycle management, operational statuses, and risk intelligence
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-colors"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>View GIS Map</span>
            </Link>

            {canManage && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Asset</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-center justify-between gap-3 border ${
              feedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Combined Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-3">
          {/* Top Row: Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by asset code (e.g. STL-1042), name, address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Bottom Row: Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Asset Type */}
            <select
              name="assetType"
              value={filters.assetType}
              onChange={handleFilterChange}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Types</option>
              <option value="STREETLIGHT">Streetlights</option>
              <option value="WATER_PIPELINE">Water Pipelines</option>
              <option value="TRANSFORMER">Transformers</option>
              <option value="ROAD">Roads</option>
              <option value="DRAINAGE">Drainage Networks</option>
              <option value="TRAFFIC_SIGNAL">Traffic Signals</option>
              <option value="PUBLIC_TOILET">Public Toilets</option>
              <option value="PARK">Parks & Gardens</option>
              <option value="GARBAGE_BIN">Garbage Bins</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Department */}
            <select
              name="departmentId"
              value={filters.departmentId}
              onChange={handleFilterChange}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-[170px] truncate"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="DAMAGED">Damaged</option>
              <option value="INACTIVE">Inactive</option>
              <option value="RETIRED">Retired</option>
            </select>

            {/* Condition */}
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Risk Level */}
            <select
              name="riskLevel"
              value={filters.riskLevel}
              onChange={handleFilterChange}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Assets Table */}
        <AssetTable
          assets={assets}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEditAsset={handleOpenEdit}
          onRetireAsset={handlePromptRetire}
          canManage={canManage}
        />
      </main>

      {/* Asset Form Modal */}
      <AssetForm
        isOpen={isFormOpen}
        mode={formMode}
        asset={selectedAsset}
        departments={departments}
        loading={formSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Retirement Confirmation Modal */}
      <ConfirmationModal
        isOpen={retireModal.isOpen}
        title={`Retire Asset ${retireModal.asset?.assetCode}?`}
        message="This infrastructure asset will be marked as RETIRED and archived. All historical work orders and complaint records will be preserved."
        confirmText="Retire & Archive"
        isDanger={true}
        onConfirm={handleConfirmRetire}
        onClose={() => setRetireModal({ isOpen: false, asset: null })}
      />
    </div>
  );
}

export default Assets;
