const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status >= 500
          ? 'API server error — check Vercel env vars (MONGODB_URI, JWT_SECRET) and redeploy'
          : 'Request failed'
      );
    }
  }

  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  getProjects: () => request('/projects'),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  getProject: (id) => request(`/projects/${id}`),
  updateProject: (id, body) =>
    request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id, email) =>
    request(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
  removeMember: (id, userId) => request(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
  getTasks: (projectId) => request(`/projects/${projectId}/tasks`),
  createTask: (projectId, body) =>
    request(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (projectId, taskId, body) =>
    request(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteTask: (projectId, taskId) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
  getDashboard: (projectId) => request(`/projects/${projectId}/dashboard`),
};
