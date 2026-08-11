import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Success! Redirect to the main dashboard
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-950 text-white p-6">
      <div className="glass-panel p-8 max-w-md w-full border-t-4 border-t-accent-500">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            CivicAsset
          </h1>
          <p className="text-accent-400 text-xs font-semibold tracking-wider uppercase">
            Sign In to Your Account
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-sm rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-primary-900/60 border border-primary-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
              placeholder="name@municipal.gov"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-primary-900/60 border border-primary-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-bold py-3 px-4 rounded-lg text-sm transition-colors cursor-pointer shadow-lg shadow-accent-500/20"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-primary-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">
            Register as a Citizen
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
