import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const apiLogin = (email: string, password: string) =>
  api.post('/auth/login', new URLSearchParams({ username: email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const apiRegister = (data: { email: string; password: string; full_name: string; role?: string }) =>
  api.post('/auth/register', data);

export const apiGetMe = () => api.get('/auth/me');

export const getAuditLogs = (params?: { entity?: string; user_email?: string; action?: string }) =>
  api.get('/audit-logs', { params });

// --- CRM ---
export const getCompanies = () => api.get('/companies/');
export const getContacts = () => api.get('/contacts/');
export const getDeals = () => api.get('/deals/');

export const createCompany = (data: any) => api.post('/companies/', data);
export const createContact = (data: any) => api.post('/contacts/', data);
export const createDeal = (data: any) => api.post('/deals/', data);

// --- HR ---
export const getEmployees = () => api.get('/employees/');
export const createEmployee = (data: any) => api.post('/employees/', data);
export const getLeaveRequests = () => api.get('/leave-requests/');
export const createLeaveRequest = (data: any) => api.post('/leave-requests/', data);
export const runLeaveAutomation = () => api.post('/automate/approve-leave/');

// --- Finance ---
export const getTransactions = () => api.get('/transactions/');
export const createTransaction = (data: any) => api.post('/transactions/', data);

// --- Supply Chain ---
export const getSuppliers = () => api.get('/suppliers/');
export const createSupplier = (data: any) => api.post('/suppliers/', data);

export const getInventory = () => api.get('/inventory/');
export const createInventoryItem = (data: any) => api.post('/inventory/', data);
export const getRestockSuggestions = () => api.post('/automate/predict-restock/');
export const executeRestock = () => api.post('/automate/execute-restock');

// --- Marketing ---
export const getCampaigns = () => api.get('/campaigns/');
export const createCampaign = (data: any) => api.post('/campaigns/', data);
export const getLeads = () => api.get('/leads/');
export const createLead = (data: any) => api.post('/leads/', data);
export const runLeadQualification = () => api.post('/automate/qualify-leads');

// --- Dashboard ---
export const getHRPayroll = () => api.get('/hr/payroll');
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardInsight = () => api.get('/dashboard/insight');

export const askAI = (query: string) => api.post('/nlq/', { query });

export default api;
