import { useState, useEffect } from 'react';
import { X, Building, FileText, AlertCircle } from 'lucide-react';

export function DepartmentForm({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  department = null,
  onSubmit,
  onClose,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setError('');
  }, [mode, department, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'create' ? 'Create Municipal Department' : 'Edit Department'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'create'
              ? 'Configure a new administrative division for asset and staff allocation'
              : `Updating details for ${department?.name}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Department Name *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Electrical & Traffic Signals"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Department Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Description / Responsibilities
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Overview of infrastructure, assets, and service areas under this department..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
            </div>
          </div>

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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Department' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentForm;
