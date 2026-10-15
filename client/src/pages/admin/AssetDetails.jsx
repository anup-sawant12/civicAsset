import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import assetService from '../../services/assetService';
import departmentService from '../../services/departmentService';
import AdminHeader from '../../components/admin/AdminHeader';
import AssetForm from '../../components/assets/AssetForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Building,
  Activity,
  Wrench,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export function AssetDetails() {
  const { id } = useParams();
  const { role } = useAuth();
  const canManage = role === 'ADMIN' || role === 'OFFICER';

  const [asset, setAsset] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);

  // Status & Condition patch state
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchAsset = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assetService.getAssetById(id);
      if (res.success && res.data) {
        setAsset(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load asset details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  useEffect(() => {
    fetchAsset();
    fetchDepartments();
  }, [fetchAsset, fetchDepartments]);

  // Handle Edit Submit
  const handleEditSubmit = async (formData) => {
    setFormSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await assetService.updateAsset(id, formData);
      if (res.success) {
        setAsset(res.data);
        setIsEditOpen(false);
        setFeedback({ type: 'success', message: 'Asset details updated successfully.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update asset';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Patch Status
  const handleQuickStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await assetService.updateAssetStatus(id, newStatus);
      if (res.success) {
        setAsset(res.data);
        setFeedback({ type: 'success', message: `Status updated to ${newStatus}` });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Quick Patch Condition
  const handleQuickConditionChange = async (newCondition) => {
    setStatusUpdating(true);
    try {
      const res = await assetService.updateAssetCondition(id, newCondition);
      if (res.success) {
        setAsset(res.data);
        setFeedback({ type: 'success', message: `Condition updated to ${newCondition}` });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update condition';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Confirm Retire
  const handleConfirmRetire = async () => {
    try {
      const res = await assetService.retireAsset(id);
      if (res.success) {
        setAsset(res.data);
        setFeedback({ type: 'success', message: 'Asset has been retired and archived.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retire asset';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsRetireModalOpen(false);
    }
  };

  const formatDateDisplay = (d) => {
    if (!d) return 'Not recorded';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AdminHeader activePage="assets" />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Retrieving asset data...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AdminHeader activePage="assets" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Asset Not Found</h2>
            <p className="text-sm text-slate-400">{error || 'The requested asset does not exist or has been removed.'}</p>
            <div className="pt-2">
              <Link
                to="/admin/assets"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Asset Registry</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="assets" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/assets"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Registry</span>
          </Link>

            <div className="flex items-center gap-2">
              <Link
                to={`/admin/map?assetId=${asset.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>View on GIS Map</span>
              </Link>

              {canManage && (
                <>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Parameters</span>
                  </button>

                  {asset.status !== 'RETIRED' && (
                    <button
                      onClick={() => setIsRetireModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retire Asset</span>
                    </button>
                  )}
                </>
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
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
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

        {/* Hero Header Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {asset.assetCode}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {asset.assetType.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  Department: <strong className="text-white">{asset.department?.name || 'Unassigned'}</strong>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {asset.description || 'No detailed technical specification provided for this physical asset.'}
              </p>
            </div>

            {/* Quick Status Modifiers */}
            {canManage && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Operational Status
                  </span>
                  <select
                    value={asset.status}
                    disabled={statusUpdating}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                    <option value="DAMAGED">DAMAGED</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Condition State
                  </span>
                  <select
                    value={asset.condition}
                    disabled={statusUpdating}
                    onChange={(e) => handleQuickConditionChange(e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                    <option value="POOR">POOR</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Geographic & Spatial Intelligence */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Compass className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Geographic & GIS Location</h2>
              </div>
              <Link
                to={`/admin/map?assetId=${asset.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                <span>View on Map →</span>
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Physical Address</span>
                  <span className="text-sm font-medium text-white">{asset.address || 'Address uncataloged'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Latitude</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{asset.latitude.toFixed(6)}°</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Longitude</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{asset.longitude.toFixed(6)}°</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400">
                <span>Coordinates verified for Municipal GIS Mapping layer integration.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Risk & Health Assessment */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Activity className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Risk & Health Matrix</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-semibold">Infrastructure Failure Risk Score</span>
                  <span className="text-sm font-mono font-bold text-white">{asset.riskScore}/100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      asset.riskScore <= 25
                        ? 'bg-emerald-500'
                        : asset.riskScore <= 50
                        ? 'bg-amber-500'
                        : asset.riskScore <= 75
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, asset.riskScore))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Risk Classification</span>
                  <span className="text-sm font-bold text-amber-400">{asset.riskLevel}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Condition</span>
                  <span className="text-sm font-bold text-teal-400">{asset.condition}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Lifecycle & Maintenance Schedule */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-blue-400">
              <Calendar className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Maintenance & Lifecycle Schedule</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Installation / Commissioning Date</span>
                </div>
                <span className="font-semibold text-white">{formatDateDisplay(asset.installationDate)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <span>Last Recorded Inspection / Maintenance</span>
                </div>
                <span className="font-semibold text-white">{formatDateDisplay(asset.lastMaintenance)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Next Scheduled Preventive Maintenance</span>
                </div>
                <span className="font-semibold text-emerald-400">{formatDateDisplay(asset.nextMaintenance)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Administrative Affiliation & Audit Records */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-purple-400">
              <Building className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Administrative Affiliation</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Department in Charge</span>
                <span className="text-sm font-bold text-white">{asset.department?.name}</span>
                <p className="text-[11px] text-slate-400 mt-1">{asset.department?.description || 'Municipal Infrastructure Division'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Cataloged Date</span>
                  <span className="text-xs font-semibold text-slate-300">{formatDateDisplay(asset.createdAt)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Last Parameter Update</span>
                  <span className="text-xs font-semibold text-slate-300">{formatDateDisplay(asset.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Integrations Module Showcase */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Cross-Module Integration Preview</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Database Schema Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-300">Complaints Logged</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-white">
                {asset._count?.complaints ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-300">Work Orders</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-white">
                {asset._count?.workOrders ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-slate-300">Maintenance Records</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-white">
                {asset._count?.maintenanceRecords ?? 0}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Form Modal */}
      <AssetForm
        isOpen={isEditOpen}
        mode="edit"
        asset={asset}
        departments={departments}
        loading={formSubmitting}
        onSubmit={handleEditSubmit}
        onClose={() => setIsEditOpen(false)}
      />

      {/* Retirement Confirmation Modal */}
      <ConfirmationModal
        isOpen={isRetireModalOpen}
        title={`Retire ${asset.assetCode}?`}
        message="Retiring this infrastructure asset will safely archive it. Active work orders and complaint records will be preserved."
        confirmText="Retire & Archive"
        isDanger={true}
        onConfirm={handleConfirmRetire}
        onClose={() => setIsRetireModalOpen(false)}
      />
    </div>
  );
}

export default AssetDetails;
