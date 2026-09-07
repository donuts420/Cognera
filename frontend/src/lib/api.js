const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, body) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });

  if (res.status === 401) {
    const err = await res.json().catch(() => ({}));
    if (err.error?.code === 'token_expired') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const refreshRes = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
        }
      }
    }
  }

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error?.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
