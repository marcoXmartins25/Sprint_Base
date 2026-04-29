import { Link } from 'react-router-dom';

function SprintCard({ sprint, onDelete }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{sprint.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
          </p>
        </div>
        <button
          onClick={() => onDelete(sprint.id)}
          className="text-gray-400 hover:text-red-600 transition ml-2"
          title="Delete sprint"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <Link
        to={`/sprints/${sprint.id}`}
        className="mt-4 inline-block text-sm font-medium text-gray-900 hover:text-gray-600"
      >
        View Tasks &rarr;
      </Link>
    </div>
  );
}

export default SprintCard;
