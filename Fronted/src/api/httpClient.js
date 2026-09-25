const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `La solicitud fallo (${response.status}).`;

    const responseText = await response.text();
    try {
      const errorBody = JSON.parse(responseText);
      message = errorBody.message || errorBody.error || errorBody.detail || message;
    } catch {
      if (responseText) message = responseText;
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const httpClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default httpClient;