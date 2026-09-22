import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import { isAuthenticated, logout } from './services/authService';

// ProtectedRoute: Redirects to /login if user is not authenticated
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    logout();
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PublicRoute: Redirects to / (dashboard) if user is already authenticated
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route (redirects to / if already logged in) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Public Register Route (redirects to / if already logged in) */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Dashboard Route (redirects to /login if not logged in) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Redirect any other unknown path to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
