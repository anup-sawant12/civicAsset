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
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
            GIS Intel & Infrastructure Suite
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-primary-200 rounded-xl pl-11 pr-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
                placeholder="name@municipal.gov"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-primary-200 rounded-xl pl-11 pr-4 py-3 text-primary-900 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-all placeholder-primary-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-accent-600/10 hover:shadow-accent-glow hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Selection */}
        <div className="mt-6 pt-5 border-t border-primary-100">
          <span className="block text-[10px] font-bold text-primary-400 uppercase tracking-widest text-center mb-2.5">
            Quick Demo Logins (Click to Autofill):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Citizen', email: 'citizen@email.com', icon: '👤', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
              { role: 'Field Worker', email: 'worker@municipal.gov', icon: '👷', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
              { role: 'Officer', email: 'officer@municipal.gov', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
              { role: 'Admin', email: 'admin@municipal.gov', icon: '⚡', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
            ].map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => {
                  setEmail(item.email);
                  setPassword('password123');
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${item.color}`}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-primary-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-600 hover:text-accent-500 font-bold transition-colors">
            Register as a Citizen
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
