import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { getMe } from '../../services/api';

export default function Layout({ children, fullScreen = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        role={user?.role}
        permissions={user?.permissions}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className={`relative z-0 flex-1 min-h-0 ${fullScreen ? 'p-0 overflow-hidden' : 'p-6 overflow-auto'}`}>
          {children}
        </main>
        {!fullScreen && <Footer />}
      </div>
    </div>
  );
}
