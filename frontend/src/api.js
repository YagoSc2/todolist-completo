const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333';

async function request(path, { body, ...opts } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    // Content-Type só quando há corpo (o Fastify rejeita JSON vazio no DELETE)
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Não foi possível concluir a operação.');
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: ({ search, status }, signal) => {
    const qs = new URLSearchParams({ search, status });
    return request(`/api/tasks?${qs}`, { signal });
  },
  create: (data) => request('/api/tasks', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/tasks/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
