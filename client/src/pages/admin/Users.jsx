import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import departmentService from '../../services/departmentService';
import AdminHeader from '../../components/admin/AdminHeader';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { UserPlus, Search, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    departmentId: '',
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    targetStatus: '',
    title: '',
    message: '',
    isDanger: false,
  });

  // Feedback notifications
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch departments for dropdowns
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  }, []);

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.departmentId) params.departmentId = filters.departmentId;

      const res = await userService.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load users';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250); // slight debounce for search input
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Open Create Form
  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (formMode === 'create') {
        const res = await userService.createUser(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `User "${res.user.firstName} ${res.user.lastName}" created successfully.` });
          setIsFormOpen(false);
          fetchUsers();
        }
      } else {
        const res = await userService.updateUser(selectedUser.id, formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `User "${res.user.firstName} ${res.user.lastName}" updated successfully.` });
          setIsFormOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Prompt Confirmation for Status change
  const handlePromptStatusChange = (user, targetStatus) => {
    if (user.id === currentUser?.id && targetStatus !== 'ACTIVE') {
      setFeedback({ type: 'error', message: 'You cannot deactivate your own administrative account.' });
      return;
    }

    const isDeactivation = targetStatus === 'INACTIVE' || targetStatus === 'SUSPENDED';
    setConfirmModal({
      isOpen: true,
      user,
      targetStatus,
      title: `${targetStatus === 'ACTIVE' ? 'Activate' : targetStatus === 'SUSPENDED' ? 'Suspend' : 'Deactivate'} User?`,
      message: `Are you sure you want to change ${user.firstName} ${user.lastName}'s status to ${targetStatus}? ${
        isDeactivation ? 'They will no longer be able to log in to the portal.' : 'They will regain access immediately.'
      }`,
      isDanger: isDeactivation,
    });
  };

  // Confirm Status change
  const handleConfirmStatusChange = async () => {
    const { user, targetStatus } = confirmModal;
    if (!user || !targetStatus) return;

    try {
      const res = await userService.updateUserStatus(user.id, targetStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: `User status changed to ${targetStatus}.` });
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      departmentId: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader activePage="users" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">Municipal Users</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {users.length} {users.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure personnel roles, departmental affiliations, and access credentials
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
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

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OFFICER">OFFICER</option>
              <option value="FIELD_WORKER">FIELD WORKER</option>
              <option value="CITIZEN">CITIZEN</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            {/* Department Filter */}
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value }))}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-[180px] truncate"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {(filters.search || filters.role || filters.status || filters.departmentId) && (
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

        {/* Users Table */}
        <UserTable
          users={users}
          loading={loading}
          currentUserId={currentUser?.id}
          onEditUser={handleOpenEdit}
          onChangeStatus={handlePromptStatusChange}
        />
      </main>

      {/* User Create/Edit Modal */}
      <UserForm
        isOpen={isFormOpen}
        mode={formMode}
        user={selectedUser}
        departments={departments}
        currentUserId={currentUser?.id}
        loading={formSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Confirmation Modal for Status Updates */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        confirmText={confirmModal.targetStatus === 'ACTIVE' ? 'Activate User' : 'Update Status'}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default Users;
