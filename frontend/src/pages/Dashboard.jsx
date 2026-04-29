import { useState, useEffect } from 'react';
import { api } from '../api';
import SprintCard from '../components/SprintCard';
import SprintForm from '../components/SprintForm';

function Dashboard() {
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSprints(); }, []);

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

  const handleCreate = async (data) => {
    await api.createSprint(data);
    setShowForm(false);
    loadSprints();
  };

  const handleUpdate = async (data) => {
    await api.updateSprint(editingSprint.id, data);
    setEditingSprint(null);
    loadSprints();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sprint and all its tasks?')) return;
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
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="text-gray-500 mt-1">Manage your weekly sprints</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200"
        >
          <span className="text-lg leading-none">+</span> New Sprint
        </button>
      </div>

      {showForm && (
        <SprintForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editingSprint && (
        <SprintForm sprint={editingSprint} onSubmit={handleUpdate} onCancel={() => setEditingSprint(null)} />
      )}

      {sprints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-gray-700 font-semibold">No sprints yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Sprint" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} onDelete={handleDelete} onEdit={setEditingSprint} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
