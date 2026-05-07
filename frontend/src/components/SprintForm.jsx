import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

function SprintForm({ sprint, onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprint) {
      setTitle(sprint.title);
      setStartDate(sprint.start_date);
      setEndDate(sprint.end_date);
    }
  }, [sprint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError(t('sprint.titleRequired'));
    if (!startDate || !endDate) return setError(t('sprint.datesRequired'));
    if (new Date(startDate) > new Date(endDate)) return setError(t('sprint.endAfterStart'));

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), start_date: startDate, end_date: endDate });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {sprint ? t('sprint.editSprint') : t('sprint.newSprint')}
              </h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                {sprint ? 'Update sprint details' : 'Plan your next sprint'}
              </p>
            </div>
            <button onClick={onCancel} className="text-white/70 hover:text-white transition text-2xl leading-none">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{sprint ? t('sprint.title') : t('sprint.title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sprint 23 — Auth & Dashboard"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">{t('sprint.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">{t('sprint.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {sprint ? t('sprint.updateSprint') : t('sprint.createSprint')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SprintForm;
