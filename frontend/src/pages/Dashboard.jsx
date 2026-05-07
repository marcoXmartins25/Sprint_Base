import { useState, useEffect } from 'react';
import { api } from '../api';
import { useLanguage } from '../LanguageContext';
import SprintCard from '../components/SprintCard';
import SprintForm from '../components/SprintForm';
import UpgradeModal from '../components/UpgradeModal';

function Dashboard() {
  const { t } = useLanguage();
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [limitError, setLimitError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => { loadSprints(); loadCompany(); }, []);

  const loadSprints = async () => {
    try {
      const data = await api.getSprints();
      const today = new Date();
      setSprints(data.sort((a, b) => {
        // Sprint ativa (hoje está entre start e end) tem prioridade máxima
        const aActive = today >= new Date(a.start_date) && today <= new Date(a.end_date);
        const bActive = today >= new Date(b.start_date) && today <= new Date(b.end_date);
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        // Depois ordena pela mais próxima de hoje (futuras primeiro, depois passadas)
        const aStart = new Date(a.start_date);
        const bStart = new Date(b.start_date);
        const aFuture = aStart >= today;
        const bFuture = bStart >= today;
        if (aFuture && bFuture) return aStart - bStart; // futuras: a que começa primeiro
        if (!aFuture && !bFuture) return bStart - aStart; // passadas: a mais recente
        return aFuture ? -1 : 1; // futuras antes de passadas
      }));
    } catch (err) {
      console.error('Failed to load sprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompany = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/companies/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCompany(data);
    } catch (err) {
      console.error('Failed to load company:', err);
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.createSprint(data);
      setShowForm(false);
      setLimitError(null);
      loadSprints();
    } catch (err) {
      if (err.message.includes('plan allows only')) {
        setLimitError(err.message);
        setShowUpgradeModal(true);
      } else {
        console.error('Failed to create sprint:', err);
      }
    }
  };

  const handleUpdate = async (data) => {
    await api.updateSprint(editingSprint.id, data);
    setEditingSprint(null);
    loadSprints();
  };

  const handleDelete = async (id) => {
    if (!confirm(t('sprint.deleteConfirm'))) return;
    try {
      await api.deleteSprint(id);
      loadSprints();
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sprint.title')}s</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">{t('dashboard.subtitle')}</p>
            {company && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize bg-indigo-100 text-indigo-700">
                {company.plan}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200"
        >
          <span className="text-lg leading-none">+</span> {t('sprint.newSprint')}
        </button>
      </div>

      {/* Limit error */}
      {limitError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">Sprint Limit Reached</p>
            <p className="text-sm text-amber-700">{limitError}</p>
          </div>
          <a href="/pricing" className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:opacity-90 transition shrink-0">
            Upgrade Now
          </a>
        </div>
      )}

      {showForm && (
        <SprintForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editingSprint && (
        <SprintForm sprint={editingSprint} onSubmit={handleUpdate} onCancel={() => setEditingSprint(null)} />
      )}

      {sprints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-gray-700 font-semibold">{t('dashboard.noSprints')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('dashboard.noSprintsHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} onDelete={handleDelete} onEdit={setEditingSprint} />
          ))}
        </div>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={limitError}
        feature="sprints"
      />
    </div>
  );
}

export default Dashboard;
