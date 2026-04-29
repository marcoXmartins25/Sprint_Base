const API_BASE = '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
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
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => {
    localStorage.removeItem('token');
  },
  verify: () => fetchApi('/auth/verify'),

  getUsers: () => fetchApi('/users'),
  updateUser: (id, data) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return fetch(`/api/users/${id}/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    }).then((r) => r.json());
  },
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
    const token = localStorage.getItem('token');
    window.open(`${API_BASE}/sprints/${sprintId}/report?token=${token}`, '_blank');
  },
};

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Carrega imagens protegidas e devolve um blob URL
export async function loadProtectedImage(url) {
  if (!url) return null;
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
