import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { linkGoogleAccount, oauthLogin } from '../services/api';
import { supabase, isSupabaseOAuthConfigured } from '../services/supabase';

export default function AuthCallback() {
  const [message, setMessage] = useState('Signing you in...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      const mode = searchParams.get('mode') || 'user';

      if (!isSupabaseOAuthConfigured) {
        setMessage('Google login is not configured.');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) {
        setMessage(error?.message || 'Google login failed.');
        return;
      }

      try {
        if (mode === 'link') {
          await linkGoogleAccount({ accessToken: data.session.access_token });
          navigate('/settings');
          return;
        }

        const res = await oauthLogin({ accessToken: data.session.access_token });
        const { token, user } = res.data;

        if (mode === 'admin' && !['admin', 'staff'].includes(user.role)) {
          await supabase.auth.signOut();
          setMessage('Access denied. Please use the user login page.');
          setTimeout(() => navigate('/login'), 1200);
          return;
        }

        if (mode !== 'admin' && user.role !== 'user') {
          await supabase.auth.signOut();
          setMessage('Please use the admin login page.');
          setTimeout(() => navigate('/admin-login'), 1200);
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('permissions', JSON.stringify(user.permissions || {}));

        if (user.role === 'admin') navigate('/admin-dashboard');
        else if (user.role === 'staff') navigate(user.permissions?.['dashboard.show'] ? '/admin-dashboard' : '/staff-dashboard');
        else navigate('/user-dashboard');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Could not complete Google login.');
      }
    };

    finishLogin();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Google Login</h2>
        <p className="text-gray-500 text-sm mt-2">{message}</p>
      </div>
    </div>
  );
}
