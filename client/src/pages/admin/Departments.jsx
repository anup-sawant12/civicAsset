import { useState, useEffect, useCallback } from 'react';
import departmentService from '../../services/departmentService';
import AdminHeader from '../../components/admin/AdminHeader';
import DepartmentTable from '../../components/departments/DepartmentTable';
import DepartmentForm from '../../components/departments/DepartmentForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Plus, Search, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedDept, setSelectedDept] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    dept: null,
    targetActive: false,
    title: '',
    message: '',
  });

  // Feedback notifications
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.isActive !== '') params.isActive = filters.isActive;

      const res = await departmentService.getDepartments(params);
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load departments';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartments();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchDepartments]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedDept(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dept) => {
    setFormMode('edit');
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (formMode === 'create') {
        const res = await departmentService.createDepartment(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Department "${res.department.name}" created successfully.` });
          setIsFormOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await departmentService.updateDepartment(selectedDept.id, formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Department "${res.department.name}" updated successfully.` });
          setIsFormOpen(false);
          fetchDepartments();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save department';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Prompt Confirmation for Activate/Deactivate
  const handlePromptToggleStatus = (dept) => {
    const newStatus = !dept.isActive;
    if (!newStatus) {
      // Deactivating
      setConfirmModal({
        isOpen: true,
        dept,
        targetActive: false,
        title: `Deactivate ${dept.name}?`,
        message: 'New municipal officers, field workers, and assets cannot be assigned to an inactive department. Existing records remain intact.',
      });
    } else {
      // Activating
      setConfirmModal({
        isOpen: true,
        dept,
        targetActive: true,
        title: `Activate ${dept.name}?`,
        message: 'This department will become immediately available for staff and asset assignments.',
      });
    }
  };

  // Confirm Status Update
  const handleConfirmToggleStatus = async () => {
    const { dept, targetActive } = confirmModal;
    if (!dept) return;

    try {
      const res = await departmentService.updateDepartmentStatus(dept.id, targetActive);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Department "${dept.name}" ${targetActive ? 'activated' : 'deactivated'} successfully.`,
        });
        fetchDepartments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update department status';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      isActive: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="departments" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">Municipal Departments</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {departments.length} {departments.length === 1 ? 'Division' : 'Divisions'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure civic sectors, manage operational divisions, and monitor resource assignments
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
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

        {/* Filter bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search by department name or description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.isActive}
              onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            {(filters.search || filters.isActive !== '') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Departments Table */}
        <DepartmentTable
          departments={departments}
          loading={loading}
          onEditDepartment={handleOpenEdit}
          onToggleStatus={handlePromptToggleStatus}
        />
      </main>

      {/* Department Create/Edit Modal */}
      <DepartmentForm
        isOpen={isFormOpen}
        mode={formMode}
        department={selectedDept}
        loading={formSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={!confirmModal.targetActive}
        confirmText={confirmModal.targetActive ? 'Activate Department' : 'Deactivate Department'}
        onConfirm={handleConfirmToggleStatus}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default Departments;
