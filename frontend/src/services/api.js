const API_BASE = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Batches
  getBatches: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/batches${query ? `?${query}` : ''}`);
  },
  getBatchDetail: (id) => request(`/batches/${id}`),
  createBatch: (data) => request('/batches', { method: 'POST', body: JSON.stringify(data) }),
  scanReentry: (data) => request('/batches/scan-reentry', { method: 'POST', body: JSON.stringify(data) }),
  queryAssistant: (data) => request('/batches/query-assistant', { method: 'POST', body: JSON.stringify(data) }),

  // Returns
  getReturns: () => request('/returns'),
  createReturn: (data) => request('/returns', { method: 'POST', body: JSON.stringify(data) }),

  // Handoffs
  getHandoffs: () => request('/handoffs'),
  verifyHandoff: (data) => request('/handoffs/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Destruction & Certificates
  manufacturerReceive: (batchId) => request(`/destruction/manufacturer-receive/${batchId}`, { method: 'POST' }),
  uploadCertificate: (data) => request('/destruction/upload-certificate', { method: 'POST', body: JSON.stringify(data) }),

  // Alerts & Investigations
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/alerts${query ? `?${query}` : ''}`);
  },
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: 'POST' }),
  getInvestigations: () => request('/investigations'),
  dispatchInspector: (batchId) => request(`/investigations/batch/${batchId}/dispatch-inspector`, { method: 'POST' }),
  quarantineStock: (batchId) => request(`/investigations/batch/${batchId}/quarantine`, { method: 'POST' }),

  // Analytics & Demo
  getSummary: () => request('/analytics/summary'),
  runFraudDemo: () => request('/demo/run-fraud-scenario', { method: 'POST' }),
};
