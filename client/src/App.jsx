import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import UserDashboard from './pages/UserDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageStaff from './pages/ManageStaff';
import ManageOrders from './pages/ManageOrders';
import ManageTemplates from './pages/ManageTemplates';
import TemplateEditor from './pages/TemplateEditor';
import Settings from './pages/Settings';
import CanvasApp from './pages/CanvasApp';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin', 'staff']} requiredPermission="dashboard.show">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/staff" element={
          <PrivateRoute allowedRoles={['admin', 'staff']} requiredPermission="staff.show">
            <ManageStaff />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/users" element={
          <PrivateRoute allowedRoles={['admin', 'staff']} requiredPermission="users.show">
            <ManageUsers />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/orders" element={
          <PrivateRoute allowedRoles={['admin', 'staff']}>
            <ManageOrders />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/orders/:id" element={
          <PrivateRoute allowedRoles={['admin', 'staff']}>
            <ManageOrders />
          </PrivateRoute>
        } />
<<<<<<< HEAD
=======
        <Route path="/admin-dashboard/templates" element={
          <PrivateRoute allowedRoles={['admin', 'staff']}>
            <ManageTemplates />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/templates/new" element={
          <PrivateRoute allowedRoles={['admin', 'staff']}>
            <TemplateEditor />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/templates/:id/edit" element={
          <PrivateRoute allowedRoles={['admin', 'staff']}>
            <TemplateEditor />
          </PrivateRoute>
        } />
>>>>>>> 89a0e65 (Template functionality)
        <Route path="/staff-dashboard" element={
          <PrivateRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </PrivateRoute>
        } />
        <Route path="/user-dashboard" element={
          <PrivateRoute allowedRoles={['user']}>
            <UserDashboard />
          </PrivateRoute>
        } />
        <Route path="/user-dashboard/orders/:id" element={
          <PrivateRoute allowedRoles={['user']}>
            <UserDashboard />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute allowedRoles={['admin', 'staff', 'user']}>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/canvas-app" element={
          <PrivateRoute allowedRoles={['admin', 'staff', 'user']}>
            <CanvasApp />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;