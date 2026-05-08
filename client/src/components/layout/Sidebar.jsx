import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList } from 'lucide-react';

const navItems = {
  admin: [
    { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin-dashboard/users', icon: Users },
  ],
  staff: [
    { label: 'Dashboard', path: '/staff-dashboard', icon: LayoutDashboard },
    // { label: 'Tasks', path: '/staff-dashboard/tasks', icon: ClipboardList },
  ],
  user: [
    { label: 'Dashboard', path: '/user-dashboard', icon: LayoutDashboard },
  ],
};

export default function Sidebar({ role, isOpen, onClose }) {
  const items = navItems[role] || navItems.user;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 flex flex-col
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
          <span className="text-lg font-semibold tracking-wide">MyApp</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
}
