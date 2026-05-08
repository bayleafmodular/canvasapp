import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { getMe } from '../../services/api';

export default function Layout({ children }) {
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
