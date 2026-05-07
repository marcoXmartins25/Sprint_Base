import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useLanguage } from '../LanguageContext';
import Avatar from '../components/Avatar';

function Profile() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    const data = await api.verify();
    setUser(data.user);
    setName(data.user.name || '');
    setEmail(data.user.email || '');
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const updated = await api.updateUser(user.id, { name, email });
      if (updated.error) { setError(updated.error); return; }
      setUser((u) => ({ ...u, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const updated = await api.uploadAvatar(user.id, file);
    setUser((u) => ({ ...u, avatar_url: updated.avatar_url }));
    setUploading(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div onClick={() => fileRef.current.click()}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg cursor-pointer overflow-hidden bg-indigo-100 flex items-center justify-center relative group">
                <Avatar user={user} size="w-full h-full" textSize="text-2xl" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  {uploading
                    ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    : <span className="text-white text-xs font-semibold">📷 Change</span>}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{user.name || t('profile.noName')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">{t('profile.details')}</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-600">{t('profile.displayName')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={t('profile.namePlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-600">{t('auth.email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2">
            {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            {t('profile.saveChanges')}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">✓ {t('profile.saved')}</span>}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">🖼️</span>
        <div>
          <p className="text-sm font-semibold text-indigo-700">{t('profile.photoTitle')}</p>
          <p className="text-xs text-indigo-400 mt-0.5">{t('profile.photoHint')}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
