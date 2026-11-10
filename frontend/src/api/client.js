/**
 * NexusRAG Base API Client
 * Manages cookie-based session authentication, double-submit CSRF headers, and standard error envelopes.
 */

let cachedCsrfToken = null;

// Read CSRF token from meta tag or fetch from system health check
export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const res = await fetch('/api/v1/health', { credentials: 'include' });
    const csrfHeader = res.headers.get('X-CSRF-Token');
    if (csrfHeader) {
      cachedCsrfToken = csrfHeader;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn('Could not preemptively fetch CSRF token:', err);
  }
  return cachedCsrfToken;
}

export function setCsrfToken(token) {
  cachedCsrfToken = token;
}

export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    ...(options.headers || {}),
  };

  // State-changing requests must include CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!cachedCsrfToken) {
      await getCsrfToken();
    }
    if (cachedCsrfToken) {
      headers['X-CSRF-Token'] = cachedCsrfToken;
    }
  }

  // Set JSON content-type if body is JSON string and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Ensures nexus_session cookie is sent
  });

  // Check for refreshed CSRF token in response headers
  const newCsrf = response.headers.get('X-CSRF-Token');
  if (newCsrf) {
    cachedCsrfToken = newCsrf;
  }

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (_) {
      errorData = { error: { message: response.statusText } };
    }
    const err = new Error(errorData?.error?.message || `API error ${response.status}`);
    err.status = response.status;
    err.code = errorData?.error?.code || 'UNKNOWN_ERROR';
    err.details = errorData?.error?.details || {};
    throw err;
  }

  // If response is 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

