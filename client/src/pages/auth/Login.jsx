import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRoleDashboardPath } from '../../utils/authUtils';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Role-based redirect
      const destination = location.state?.from?.pathname || getRoleDashboardPath(res.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      if (!err.response) {
        setErrorMessage('Cannot connect to CivicAsset backend. Please ensure server is running on port 5000.');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to access your CivicAsset municipal portal
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@city.gov or user@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-150"
            />
            <button
              type="button"
              id="toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Fill */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
          Quick Demo Accounts (One-Click Fill)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFormData({ email: 'admin@civicasset.gov', password: 'AdminPassword123!' })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
          >
            <span className="block font-semibold text-rose-400">Admin</span>
            <span className="text-[10px] text-slate-400 truncate block">admin@civicasset.gov</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'officer.works@civicasset.gov', password: 'OfficerPassword123!' })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
          >
            <span className="block font-semibold text-blue-400">Officer</span>
            <span className="text-[10px] text-slate-400 truncate block">officer.works@...</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'worker@civicasset.gov', password: 'WorkerPassword123!' })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
          >
            <span className="block font-semibold text-amber-400">Field Worker</span>
            <span className="text-[10px] text-slate-400 truncate block">worker@civicasset.gov</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ email: 'citizen@example.com', password: 'CitizenPassword123!' })}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
          >
            <span className="block font-semibold text-emerald-400">Citizen</span>
            <span className="text-[10px] text-slate-400 truncate block">citizen@example.com</span>
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-5 pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1 transition-colors"
          >
            Register as Citizen
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
