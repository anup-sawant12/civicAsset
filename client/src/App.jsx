import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// A simple helper to protect pages
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Public Register Route */}
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Route (Checks if logged in) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="flex items-center justify-center min-h-screen bg-primary-950 text-white p-6">
                <div className="glass-panel p-8 max-w-lg w-full text-center border-t-4 border-t-accent-500">
                  <h1 className="text-3xl font-extrabold text-white mb-2">Welcome to CivicAsset Dashboard!</h1>
                  <p className="text-success font-bold text-lg mb-6">You are authenticated!</p>
                  
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Redirect any other path to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
