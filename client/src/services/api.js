import axios from 'axios';

// REST API base URL
const API_URL = 'http://212.90.121.86:1317';
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
  fetchStockMovementLogs: () => axios.get(`${API_URL}/erprollup/inventory/stock_movement_log`),
  fetchStockMovementLog: (id) => axios.get(`${API_URL}/erprollup/inventory/stock_movement_log/${id}`),
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
};

export { api, cli };