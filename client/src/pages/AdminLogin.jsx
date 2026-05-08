import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await loginUser(data);
      const { token, user } = res.data;

      if (!['admin', 'staff'].includes(user.role)) {
        setServerError('Access denied. Please use the user login page.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/staff-dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      const email = err.response?.data?.email;
      if (err.response?.status === 403 && email) {
        navigate('/verify-email', { state: { email } });
        return;
      }
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="text-center mb-6">
          {/* <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-3">👑</div> */}
          <h2 className="text-2xl font-bold text-gray-800">Admin / Staff Login</h2>
          <p className="text-gray-500 text-sm mt-1">Restricted access — authorized person only</p>
        </div>

        {serverError && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{serverError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', {
                requiindigo: 'Email is requiindigo',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
              placeholder="admin@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.email && <p className="text-indigo-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { requiindigo: 'Password is requiindigo' })}
              placeholder="Your password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.password && <p className="text-indigo-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* <p className="text-sm text-center text-gray-500 mt-6">
          Not an admin?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline font-medium">User Login</Link>
        </p> */}
      </div>
    </div>
  );
}
