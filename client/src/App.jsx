import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getRoleDashboardPath } from './utils/authUtils';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import OfficerDashboard from './pages/dashboards/OfficerDashboard';
import WorkerDashboard from './pages/dashboards/WorkerDashboard';
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import Unauthorized from './pages/dashboards/Unauthorized';
import Users from './pages/admin/Users';
import Departments from './pages/admin/Departments';
import Assets from './pages/admin/Assets';
import AssetDetails from './pages/admin/AssetDetails';
import AssetMapPage from './pages/admin/AssetMap';
import CitizenComplaints from './pages/citizen/Complaints';
import CreateComplaint from './pages/citizen/CreateComplaint';
import CitizenComplaintDetails from './pages/citizen/ComplaintDetails';
import OfficerComplaints from './pages/officer/Complaints';
import OfficerComplaintDetails from './pages/officer/ComplaintDetails';
import AdminComplaints from './pages/admin/Complaints';
import AdminComplaintDetails from './pages/admin/ComplaintDetails';
import OfficerWorkOrders from './pages/officer/WorkOrders';
import OfficerWorkOrderDetails from './pages/officer/WorkOrderDetails';
import WorkerWorkOrders from './pages/worker/WorkOrders';
import WorkerWorkOrderDetails from './pages/worker/WorkOrderDetails';
import AdminWorkOrders from './pages/admin/WorkOrders';
import AdminWorkOrderDetails from './pages/admin/WorkOrderDetails';

/**
 * Root index route redirection based on authentication and role
 */
function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes wrapped in AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Role-Protected Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Municipal Infrastructure Asset Management */}
          <Route
            path="/admin/assets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FIELD_WORKER']}>
                <Assets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FIELD_WORKER']}>
                <AssetDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/map"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER', 'FIELD_WORKER']}>
                <AssetMapPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Modules */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Departments />
              </ProtectedRoute>
            }
          />

          {/* Admin Complaints Oversight */}
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Work Orders Oversight */}
          <Route
            path="/admin/work-orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminWorkOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/work-orders/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminWorkOrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Officer Dashboard & Complaints Queue */}
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/complaints"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Officer Work Orders Dispatch */}
          <Route
            path="/officer/work-orders"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerWorkOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/work-orders/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerWorkOrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Field Worker Dashboard & Tasks */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FIELD_WORKER']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/work-orders"
            element={
              <ProtectedRoute allowedRoles={['FIELD_WORKER']}>
                <WorkerWorkOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/work-orders/:id"
            element={
              <ProtectedRoute allowedRoles={['FIELD_WORKER']}>
                <WorkerWorkOrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Citizen Portal & Reporting Hotline */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints/new"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CreateComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized access page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default entry redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
