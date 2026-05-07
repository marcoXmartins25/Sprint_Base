import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700 border-gray-200',
  pro: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  team: 'bg-violet-100 text-violet-700 border-violet-200',
};

function Company() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    primaryColor: '#6366f1',
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/companies/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCompany(data);
      setFormData({
        name: data.name,
        email: data.email,
        primaryColor: data.primary_color || '#6366f1',
      });
    } catch (err) {
      console.error('Failed to load company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/companies/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          primaryColor: formData.primaryColor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        alert('Company settings updated successfully');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('http://localhost:3000/api/companies/logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        loadCompany();
      }
    } catch (err) {
      console.error('Failed to upload logo:', err);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const canEdit = currentUser?.companyRole === 'owner' || currentUser?.companyRole === 'admin';
  const isTeamPlan = company?.plan === 'team';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 mt-1">Manage your company profile and subscription</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border capitalize ${PLAN_COLORS[company?.plan] || PLAN_COLORS.free}`}>
            {company?.plan}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">
              {company?.plan === 'free' ? '2' : '∞'}
            </p>
            <p className="text-sm text-gray-500">Active Sprints</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">
              {company?.plan === 'free' ? '20' : '∞'}
            </p>
            <p className="text-sm text-gray-500">Tasks per Sprint</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">
              {company?.plan === 'free' ? '3' : company?.plan === 'pro' ? '10' : '∞'}
            </p>
            <p className="text-sm text-gray-500">Team Members</p>
          </div>
        </div>

        {company?.plan !== 'team' && (
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition">
            <span>⚡</span> Upgrade Plan
          </Link>
        )}
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60"
            />
          </div>

          {canEdit && (
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2">
              {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              Save Changes
            </button>
          )}
        </form>
      </div>

      {/* Branding (Team Plan Only) */}
      {isTeamPlan && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Custom Branding</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Company Logo</label>
              <div className="flex items-center gap-4">
                {company?.logo_url ? (
                  <img
                    src={`http://localhost:3000${company.logo_url}`}
                    alt="Company logo"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                    {company?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {canEdit && (
                  <label className="cursor-pointer px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition">
                    {uploading ? 'Uploading...' : 'Change Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Max 2MB. Used in PDF reports.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  disabled={!canEdit}
                  className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer disabled:opacity-60"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  disabled={!canEdit}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Used in PDF reports and branding.</p>
            </div>
          </div>
        </div>
      )}

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ⚠️ Only owners and admins can edit company settings.
        </div>
      )}
    </div>
  );
}

export default Company;
