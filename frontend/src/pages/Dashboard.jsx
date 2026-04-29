import { useState, useEffect } from 'react';
import { api } from '../api';
import SprintCard from '../components/SprintCard';
import SprintForm from '../components/SprintForm';

function Dashboard() {
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      const data = await api.getSprints();
      setSprints(data);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition"
        >
          {showForm ? 'Cancel' : 'New Sprint'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-8 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Create New Sprint</h2>
          <SprintForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {sprints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <p className="text-gray-500 text-lg">No sprints yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first sprint to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
