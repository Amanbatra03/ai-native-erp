import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getCompanies = () => api.get('/companies/');
export const getContacts = () => api.get('/contacts/');
export const getDeals = () => api.get('/deals/');

export const createCompany = (data: any) => api.post('/companies/', data);
export const createContact = (data: any) => api.post('/contacts/', data);
export const createDeal = (data: any) => api.post('/deals/', data);

export const getEmployees = () => api.get('/employees/');
export const createEmployee = (data: any) => api.post('/employees/', data);
export const getLeaveRequests = () => api.get('/leave-requests/');
export const createLeaveRequest = (data: any) => api.post('/leave-requests/', data);
export const runLeaveAutomation = () => api.post('/automate/approve-leave/');

export const getTransactions = () => api.get('/transactions/');
export const createTransaction = (data: any) => api.post('/transactions/', data);

export const getSuppliers = () => api.get('/suppliers/');
export const createSupplier = (data: any) => api.post('/suppliers/', data);

export const getInventory = () => api.get('/inventory/');
export const createInventoryItem = (data: any) => api.post('/inventory/', data);
export const getRestockSuggestions = () => api.post('/automate/predict-restock/');
export const executeRestock = () => api.post('/automate/execute-restock');

export const getCampaigns = () => api.get('/campaigns/');
export const createCampaign = (data: any) => api.post('/campaigns/', data);
export const getLeads = () => api.get('/leads/');
export const createLead = (data: any) => api.post('/leads/', data);
export const runLeadQualification = () => api.post('/automate/qualify-leads');

export const getHRPayroll = () => api.get('/hr/payroll');

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardInsight = () => api.get('/dashboard/insight');

export const askAI = (query: string) => api.post('/nlq/', { query });

export default api;
