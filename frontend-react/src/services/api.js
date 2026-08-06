import { BACKEND_URL } from '../../options';
import { getToken, removeToken } from '../utils/auth';

const DEFAULT_TIMEOUT_MS = 15000;

const getApiUrl = (endpoint) => {
  const baseUrl = BACKEND_URL ? (BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`) : '/';
  return `${baseUrl}${endpoint.replace(/^\//, '')}`;
};

export const authFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData && options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: options.signal || controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      removeToken();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Unauthorized access. Invalid or expired token.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let message = errorData.message;

      if (!message) {
        switch (response.status) {
          case 400:
            message = 'Bad request. Please check your inputs.';
            break;
          case 403:
            message = 'Forbidden. You do not have permission.';
            break;
          case 404:
            message = 'Resource not found.';
            break;
          case 500:
            message = 'Internal server error. Please try again later.';
            break;
          default:
            message = `HTTP error! Status: ${response.status}`;
        }
      }

      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const apiGet = (endpoint, options = {}) => {
  return authFetch(endpoint, { ...options, method: 'GET' });
};

export const apiPost = (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  return authFetch(endpoint, {
    ...options,
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiPut = (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  return authFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: isFormData ? body : JSON.stringify(body),
  });
};

export const apiDelete = (endpoint, options = {}) => {
  return authFetch(endpoint, { ...options, method: 'DELETE' });
};
