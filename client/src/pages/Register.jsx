import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await register(email, password, firstName, lastName);
      // Success! Redirect to the main dashboard
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
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
            Create a Citizen Account
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-sm rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-primary-900/60 border border-primary-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Anup"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-primary-900/60 border border-primary-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
                placeholder="Sawant"
              />
            </div>
          </div>

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
              placeholder="xyz@email.com"
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

          <div>
            <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-primary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-semibold transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
