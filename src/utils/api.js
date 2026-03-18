const API_BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function apiGet(url) {
  return request(url);
}

export function apiPost(url, body) {
  return request(url, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut(url, body) {
  return request(url, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete(url) {
  return request(url, { method: 'DELETE' });
}
