import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import UserDashboard from './pages/UserDashboard';
import ManageUsers from './pages/ManageUsers';
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
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard/users" element={
          <PrivateRoute allowedRoles={['admin']}>
            <ManageUsers />
          </PrivateRoute>
        } />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
