import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL });

export const getRuns = (limit = 50) => api.get('/runs', { params: { limit } }).then(r => r.data);
export const getRunDetail = (runId) => api.get(`/runs/${runId}`).then(r => r.data);
export const fetchAwsEvidence = () => api.post('/runs/collect', {}, { timeout: 120000 }).then(r => r.data);
export const getEvidence = (limit = 200) => api.get('/evidence', { params: { limit } }).then(r => r.data);
export const getEvidenceById = (id) => api.get(`/evidence/${id}`).then(r => r.data);
export const getEvidenceContent = (id) => api.get(`/evidence/${id}/content`).then(r => r.data);
export const getControls = () => api.get('/controls').then(r => r.data);
export const getControl = (controlId) => api.get(`/control/${controlId}`).then(r => r.data);
export const getControlsCoverage = () => api.get('/controls/coverage').then(r => r.data);
export const submitEvidence = (body) => api.post('/evidence', body).then(r => r.data);

export default api;
