const API_BASE = '/api';

async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Something went wrong' }));
    throw new Error(error.error);
  }

  return res.json();
}

export const api = {
  getSprints: () => fetchApi('/sprints'),
  getSprint: (id) => fetchApi(`/sprints/${id}`),
  createSprint: (data) => fetchApi('/sprints', { method: 'POST', body: JSON.stringify(data) }),
  updateSprint: (id, data) => fetchApi(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSprint: (id) => fetchApi(`/sprints/${id}`, { method: 'DELETE' }),

  getSprintTasks: (sprintId) => fetchApi(`/sprints/${sprintId}/tasks`),
  createTask: (data) => fetchApi('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => fetchApi(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => fetchApi(`/tasks/${id}`, { method: 'DELETE' }),

  downloadReport: (sprintId) => {
    window.open(`${API_BASE}/sprints/${sprintId}/report`, '_blank');
  },
};
