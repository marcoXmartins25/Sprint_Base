import { useState, useEffect } from 'react';

const ROLE_COLORS = {
  owner: 'bg-violet-100 text-violet-700 border-violet-200',
  admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  member: 'bg-gray-100 text-gray-700 border-gray-200',
};

function Team() {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadMembers(), loadInvites()]);
    setLoading(false);
  };

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const loadInvites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/team/invites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInvites(data);
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setInviting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'member' });
      loadInvites();
    } catch (err) {
      setError('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId, userEmail) => {
    if (!confirm(`Remove ${userEmail} from the team?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/team/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!confirm('Cancel this invite?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/team/invites/${inviteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadInvites();
      }
    } catch (err) {
      console.error('Failed to cancel invite:', err);
    }
  };

  const canManageTeam = currentUser?.companyRole === 'owner' || currentUser?.companyRole === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">Manage your team and invitations</p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-md">
            <span className="text-lg leading-none">+</span> Invite Member
          </button>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Active Members ({members.length})</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
              {canManageTeam && <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-20"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      <img src={`http://localhost:3000${member.avatar_url}`} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name || 'No name'}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${ROLE_COLORS[member.company_role] || ROLE_COLORS.member}`}>
                    {member.company_role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </td>
                {canManageTeam && (
                  <td className="px-6 py-4 text-center">
                    {member.company_role !== 'owner' && member.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove member">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invites */}
      {canManageTeam && invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Pending Invites ({invites.length})</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invited By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invites.map(invite => (
                <tr key={invite.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{invite.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${ROLE_COLORS[invite.role] || ROLE_COLORS.member}`}>
                      {invite.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{invite.invited_by_name || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Cancel invite">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
                  <p className="text-indigo-200 text-sm mt-0.5">Send an invitation to join your team</p>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="text-white/70 hover:text-white text-2xl leading-none transition">×</button>
              </div>
            </div>

            <form onSubmit={handleInvite} className="px-6 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="colleague@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {inviting && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
