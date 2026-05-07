import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['to-do', 'in-progress', 'done'];

const priorityColor = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

function TaskForm({ task, sprintId, users = [], onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: '', description: '', status: 'to-do', priority: 'medium',
    due_start: '', due_end: '', assigned_to: '',
    week: '', deliverable: '', definition_of_done: '', dependencies: '', risk: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'to-do',
        priority: task.priority || 'medium',
        due_start: task.due_start ? task.due_start.slice(0, 10) : '',
        due_end: task.due_end ? task.due_end.slice(0, 10) : '',
        assigned_to: task.assigned_to || '',
        week: task.week || '',
        deliverable: task.deliverable || '',
        definition_of_done: task.definition_of_done || '',
        dependencies: task.dependencies || '',
        risk: task.risk || '',
      });
    }
  }, [task]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError(t('task.titleRequired'));
    setLoading(true);
    try {
      await onSubmit({ sprint_id: sprintId, ...form, title: form.title.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{task ? t('task.editTask') : t('task.newTask')}</h2>
            <p className="text-indigo-200 text-sm mt-0.5">{task ? 'Update task details' : 'Add a task to this sprint'}</p>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white text-2xl leading-none transition">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{t('task.taskName')}</label>
            <input
              type="text" value={form.title} onChange={set('title')}
              placeholder="e.g., Implement login page"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.priority')}</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition border ${
                      form.priority === p ? priorityColor[p] + ' border-transparent' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.status')}</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Start + Due End */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.dueStart')}</label>
              <input type="date" value={form.due_start} onChange={set('due_start')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.dueEnd')}</label>
              <input type="date" value={form.due_end} onChange={set('due_end')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          {/* Week */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{t('task.week')}</label>
            <input type="text" value={form.week} onChange={set('week')} placeholder={t('task.weekPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>

          {/* Deliverable + Risk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.deliverable')}</label>
              <input type="text" value={form.deliverable} onChange={set('deliverable')} placeholder={t('task.deliverablePlaceholder')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">{t('task.risk')}</label>
              <input type="text" value={form.risk} onChange={set('risk')} placeholder={t('task.riskPlaceholder')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>

          {/* Definition of Done */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{t('task.definitionOfDone')}</label>
            <textarea value={form.definition_of_done} onChange={set('definition_of_done')} rows={2}
              placeholder={t('task.definitionOfDonePlaceholder')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>

          {/* Dependencies */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{t('task.dependencies')}</label>
            <input type="text" value={form.dependencies} onChange={set('dependencies')} placeholder={t('task.dependenciesPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{t('task.description')}</label>
            <textarea value={form.description} onChange={set('description')} rows={2}
              placeholder={t('task.descriptionPlaceholder')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {task ? t('task.updateTask') : t('task.addTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
