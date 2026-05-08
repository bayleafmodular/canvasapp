import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getAdminStats } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, bg: 'bg-blue-500' },
    { label: 'Active Users', value: stats?.activeUsers, bg: 'bg-green-500' },
    { label: 'Staff Count', value: stats?.staffCount, bg: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">

        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Full system access — manage users, roles, and platform settings.</p>
        </div>

        {/* Stats */}
        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map(({ label, value, bg }) => (
              <div key={label} className={`${bg} rounded-xl shadow-md p-5 text-white`}>
                <p className="text-sm font-medium opacity-80">{label}</p>
                <p className="text-4xl font-bold mt-1">
                  {loading ? '...' : value ?? '0'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs tracking-wide">
                  <th className="pb-3 pr-6">Name</th>
                  <th className="pb-3 pr-6">Email</th>
                  <th className="pb-3 pr-6">Role</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-sm">Loading...</td></tr>
                ) : stats?.recentUsers?.length ? (
                  stats.recentUsers.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-6 font-medium text-gray-700">{u.name}</td>
                      <td className="py-3 pr-6 text-gray-500">{u.email}</td>
                      <td className="py-3 pr-6">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                          ${u.role === 'admin' ? 'bg-red-100 text-red-600' :
                            u.role === 'staff' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-indigo-100 text-indigo-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
