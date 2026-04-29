import { useNavigate } from 'react-router-dom';

function SprintCard({ sprint, onDelete, onEdit }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-PT', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/app/sprints/${sprint.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-indigo-100 transition cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition">
            {sprint.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(sprint); }}
            className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
            title="Edit sprint"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(sprint.id); }}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete sprint"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SprintCard;
