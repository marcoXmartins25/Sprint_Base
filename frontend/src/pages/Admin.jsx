import { useState, useEffect } from 'react';
import { api } from '../api';
import { useLanguage } from '../LanguageContext';

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700 border-gray-200',
  pro: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  team: 'bg-violet-100 text-violet-700 border-violet-200',
};

function Admin() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/test/me');
      const data = await response.json();
      if (data.role === 'admin') {
        setIsAdmin(true);
        loadUsers();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      // Get plan info for each user
      const usersWithPlans = await Promise.all(
        data.map(async (user) => {
          try {
            const planData = await fetch(`http://localhost:3000/api/test/plan/${user.id}`);
            const plan = await planData.json();
            return { ...user, ...plan.user, limits: plan.limits };
          } catch {
            return { ...user, plan: 'free' };
          }
        })
      );
      setUsers(usersWithPlans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (userId, newPlan) => {
    setUpdating(userId);
    try {
      const response = await fetch(`http://localhost:3000/api/test/plan/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      const data = await response.json();
      
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, plan: data.user.plan, limits: data.limits }
          : u
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/test/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error);
        return;
      }
      
      setCreatedUser({ email: newUser.email, password: newUser.password });
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`Delete user ${userEmail}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/test/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        alert('Server error: Invalid response format');
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to delete user');
        return;
      }
      
      alert(`User ${userEmail} deleted successfully`);
      loadUsers();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">🔒</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin - User Management</h1>
          <p className="text-gray-500 mt-1">Manage users, subscriptions and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-md">
          <span className="text-lg leading-none">+</span> Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {['free', 'pro', 'team'].map(plan => {
          const count = users.filter(u => u.plan === plan).length;
          return (
            <div key={plan} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{plan} users</p>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Current Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Limits</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || 'No name'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.limits ? (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>Sprints: {user.limits.maxActiveSprints || '∞'}</p>
                      <p>Tasks: {user.limits.maxTasksPerSprint || '∞'}</p>
                      <p>Extra fields: {user.limits.allowExtraFields ? '✅' : '❌'}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {['free', 'pro', 'team'].map(plan => (
                      <button
                        key={plan}
                        onClick={() => updatePlan(user.id, plan)}
                        disabled={updating === user.id || user.plan === plan}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition capitalize ${
                          user.plan === plan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}>
                        {updating === user.id ? '...' : plan}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete user">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-indigo-900 mb-2">Plan Limits</p>
        <div className="grid grid-cols-3 gap-4 text-xs text-indigo-700">
          <div>
            <p className="font-semibold">Free</p>
            <p>2 sprints, 20 tasks/sprint</p>
            <p>Basic fields only</p>
            <p>PDF with watermark</p>
          </div>
          <div>
            <p className="font-semibold">Pro (€10/month)</p>
            <p>Unlimited sprints & tasks</p>
            <p>All fields unlocked</p>
            <p>Clean PDF export</p>
          </div>
          <div>
            <p className="font-semibold">Team (€30/month)</p>
            <p>Everything in Pro +</p>
            <p>Unlimited users</p>
            <p>Custom branding</p>
            <p>Unlimited history</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {createdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreatedUser(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">✅ User Created</h2>
                  <p className="text-green-200 text-sm mt-0.5">Save these credentials</p>
                </div>
                <button onClick={() => setCreatedUser(null)} className="text-white/70 hover:text-white text-2xl leading-none transition">×</button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important</p>
                <p className="text-xs text-yellow-700">Copy these credentials now. The password won't be shown again.</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-mono text-gray-900">{createdUser.email}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Password</p>
                  <p className="text-sm font-mono text-gray-900">{createdUser.password}</p>
                </div>
              </div>

              <button
                onClick={() => setCreatedUser(null)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:opacity-90 transition">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateUser(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create New User</h2>
                  <p className="text-indigo-200 text-sm mt-0.5">Add a new user to the system</p>
                </div>
                <button onClick={() => setShowCreateUser(false)} className="text-white/70 hover:text-white text-2xl leading-none transition">×</button>
              </div>
            </div>

            <form onSubmit={createUser} className="px-6 py-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Name (optional)</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {creating && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
