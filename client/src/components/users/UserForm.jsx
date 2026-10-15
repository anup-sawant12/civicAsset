import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';

export function UserForm({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  user = null,
  departments = [],
  currentUserId,
  onSubmit,
  onClose,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'OFFICER',
    departmentId: '',
    status: 'ACTIVE',
  });

  const [error, setError] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        role: user.role || 'OFFICER',
        departmentId: user.departmentId || '',
        status: user.status || 'ACTIVE',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'OFFICER',
        departmentId: departments[0]?.id || '',
        status: 'ACTIVE',
      });
    }
    setError('');
  }, [mode, user, departments, isOpen]);

  if (!isOpen) return null;

  const isSelf = mode === 'edit' && user?.id === currentUserId;
  const isDepartmentRequired = formData.role === 'OFFICER' || formData.role === 'FIELD_WORKER';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // If role changed to CITIZEN, clear department
      if (name === 'role' && value === 'CITIZEN') {
        updated.departmentId = '';
      }
      return updated;
    });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (mode === 'create') {
      if (!formData.email.trim()) {
        setError('Email address is required');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please provide a valid email address');
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    if (isDepartmentRequired && !formData.departmentId) {
      setError(`A department is required for ${formData.role} role`);
      return;
    }

    if (isSelf && (formData.status === 'INACTIVE' || formData.status === 'SUSPENDED')) {
      setError('You cannot deactivate your own administrative account');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 my-8">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Create Municipal User' : 'Edit User Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'create'
              ? 'Provision a municipal officer, field technician, or citizen account'
              : `Updating profile details for ${user?.firstName} ${user?.lastName}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                First Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Last Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Patil"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Email Address {mode === 'create' ? '*' : '(Read-only)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                disabled={mode === 'edit'}
                value={formData.email}
                onChange={handleChange}
                placeholder="user@civicasset.gov"
                className={`w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  mode === 'edit' ? 'opacity-60 cursor-not-allowed bg-slate-950/50' : ''
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Password (Only on Create) */}
          {mode === 'create' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Temporary Password * <span className="text-slate-500 normal-case">(min 8 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* Role and Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                User Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={mode === 'edit' && user?.role === 'ADMIN'}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {mode === 'edit' && user?.role === 'ADMIN' && (
                  <option value="ADMIN">ADMIN</option>
                )}
                <option value="OFFICER">OFFICER</option>
                <option value="FIELD_WORKER">FIELD WORKER</option>
                <option value="CITIZEN">CITIZEN</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Department {isDepartmentRequired ? '*' : '(Optional)'}
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={formData.role === 'CITIZEN'}
                className={`w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  formData.role === 'CITIZEN' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">{formData.role === 'CITIZEN' ? 'No Department' : 'Select Department...'}</option>
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

          {/* Status (Only on Edit) */}
          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Account Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSelf}
                className={`w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isSelf ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
              {isSelf && (
                <p className="text-[11px] text-amber-400 mt-1">
                  You cannot modify the active status of your currently logged-in account.
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
