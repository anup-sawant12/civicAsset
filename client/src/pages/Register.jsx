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
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-50 text-primary-800 p-6 relative overflow-hidden">
      
      {/* Ambient background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-glow/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="glass-panel glass-panel-hover p-10 max-w-md w-full border-t-2 border-t-accent-500/60 shadow-medium relative z-10 animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-accent-600 via-accent-500 to-cyber-cyan bg-clip-text text-transparent">
            CivicAsset
          </h1>
          <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase">
            Create a Citizen Account
          </p>
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/25 text-danger text-xs rounded-xl p-4 mb-6 flex items-start space-x-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-danger flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
                placeholder="Anup"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
                placeholder="Sawant"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
              placeholder="xyz@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-accent-600/10 hover:shadow-accent-glow hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Registering...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-primary-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-600 hover:text-accent-500 font-bold transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
