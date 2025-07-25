// client/src/services/api.js
import axios from 'axios';

// REST API base URL
const API_URL = 'http://38.242.225.16:1317';
// Backend server for CLI commands
const SERVER_URL = '/api';

// REST API endpoints for GET requests
const api = {
  // Groups
  fetchGroups: () => axios.get(`${API_URL}/erprollup/ledger/group`),
  fetchGroup: (id) => axios.get(`${API_URL}/erprollup/ledger/group/${id}`),
  
  // Ledgers (ErpLedgers)
  fetchLedgers: () => axios.get(`${API_URL}/erprollup/ledger/erp_ledger`),
  fetchLedger: (id) => axios.get(`${API_URL}/erprollup/ledger/erp_ledger/${id}`),
  
  // Journal Entries
  fetchJournalEntries: () => axios.get(`${API_URL}/erprollup/ledger/journal_entry`),
  fetchJournalEntry: (id) => axios.get(`${API_URL}/erprollup/ledger/journal_entry/${id}`),
  
  // Bank balances
  fetchBalance: (address) => axios.get(`${API_URL}/cosmos/bank/v1beta1/balances/${address}`),
  
  // Inventory - Products
  fetchProducts: () => axios.get(`${API_URL}/erprollup/inventory/product`),
  fetchProduct: (id) => axios.get(`${API_URL}/erprollup/inventory/product/${id}`),
  
  // Inventory - Stock Entries
  fetchStockEntries: () => axios.get(`${API_URL}/erprollup/inventory/stock_entry`),
  fetchStockEntry: (productName) => axios.get(`${API_URL}/erprollup/inventory/stock_entry/${productName}`),
  
  // Inventory - Stock Movement Logs
  fetchStockMovements: () => axios.get(`${API_URL}/erprollup/inventory/stock_movement_log`),
  fetchStockMovement: (id) => axios.get(`${API_URL}/erprollup/inventory/stock_movement_log/${id}`),
  
  // HR - Offer Letters
  fetchOfferLetters: () => axios.get(`${API_URL}/erprollup/hr/offer_letter`),
  fetchOfferLetter: (id) => axios.get(`${API_URL}/erprollup/hr/offer_letter/${id}`),
  
  // HR - Employees
  fetchEmployees: () => axios.get(`${API_URL}/erprollup/hr/employee`),
  fetchEmployee: (id) => axios.get(`${API_URL}/erprollup/hr/employee/${id}`),
  
  // HR - Roles
  fetchRoles: () => axios.get(`${API_URL}/erprollup/hr/role`),
  fetchRole: (id) => axios.get(`${API_URL}/erprollup/hr/role/${id}`),
  
  // HR - Leave Requests
  fetchLeaveRequests: () => axios.get(`${API_URL}/erprollup/hr/leave_request`),
  fetchLeaveRequest: (id) => axios.get(`${API_URL}/erprollup/hr/leave_request/${id}`),
  
  // HR - User Authentication
  fetchUserAuths: () => axios.get(`${API_URL}/erprollup/hr/user_auth`),
  fetchUserAuth: (id) => axios.get(`${API_URL}/erprollup/hr/user_auth/${id}`),
};

// CLI command endpoints for POST requests
const cli = {
  // Groups
  createGroup: (data) => axios.post(`${SERVER_URL}/groups`, data),
  
  // Ledgers
  createLedger: (data) => axios.post(`${SERVER_URL}/ledgers`, data),
  
  // Journal Entries
  createJournalEntry: (data) => axios.post(`${SERVER_URL}/journal-entries`, data),
  
  // Send and Record Transaction
  sendAndRecord: (data) => axios.post(`${SERVER_URL}/send-and-record`, data),
  
  // Inventory - Products
  defineProduct: (data) => axios.post(`${SERVER_URL}/inventory/products`, data),
  
  // Inventory - Stock Movements
  recordStockMovement: (data) => axios.post(`${SERVER_URL}/inventory/stock-movements`, data),
  
  // HR - Offer Letters
  createOfferLetter: (data) => axios.post(`${SERVER_URL}/hr/offer-letters`, data),
  acceptOfferLetter: (data) => axios.post(`${SERVER_URL}/hr/accept-offer`, data),
  
  // HR - Roles
  defineRole: (data) => axios.post(`${SERVER_URL}/hr/roles`, data),
  assignRoleToEmployee: (data) => axios.post(`${SERVER_URL}/hr/assign-role`, data),
  
  // HR - Leave Requests
  submitLeaveRequest: (data) => axios.post(`${SERVER_URL}/hr/leave-requests`, data),
  processLeaveRequest: (data) => axios.post(`${SERVER_URL}/hr/process-leave-request`, data),
  
  // HR - Authentication
  changePassword: (data) => axios.post(`${SERVER_URL}/hr/change-password`, data),
};

export { api, cli };