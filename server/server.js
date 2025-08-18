// server/server.js - FIXED VERSION with Validator routes
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const groupController = require('./controllers/groupController');
const ledgerController = require('./controllers/ledgerController');
const journalEntryController = require('./controllers/journalEntryController');
const inventoryController = require('./controllers/inventoryController');
const hrController = require('./controllers/hrController');
const validatorController = require('./controllers/validatorController'); // NEW

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
const apiRouter = express.Router();

// Group routes
apiRouter.post('/groups', groupController.createGroup);

// Ledger routes
apiRouter.post('/ledgers', ledgerController.createLedger);

// Journal Entry routes
apiRouter.post('/journal-entries', journalEntryController.createJournalEntry);
apiRouter.post('/send-and-record', journalEntryController.sendAndRecord);

// Inventory routes
apiRouter.post('/inventory/products', inventoryController.defineProduct);
apiRouter.post('/inventory/stock-movements', inventoryController.recordStockMovement);

// HR routes
apiRouter.post('/hr/offer-letters', hrController.createOfferLetter);
apiRouter.post('/hr/accept-offer', hrController.acceptOfferLetter);
apiRouter.post('/hr/roles', hrController.defineRole);
apiRouter.post('/hr/assign-role', hrController.assignRoleToEmployee);
apiRouter.post('/hr/leave-requests', hrController.submitLeaveRequest);
apiRouter.post('/hr/process-leave-request', hrController.processLeaveRequest);
apiRouter.post('/hr/change-password', hrController.changePassword);

// Validator routes - NEW
apiRouter.post('/validator/setup-tracking', validatorController.setupValidatorTracking);
apiRouter.post('/validator/manual-earnings', validatorController.recordManualEarnings);
apiRouter.post('/validator/expenditure', validatorController.recordExpenditure);

// Use API router
app.use('/api', apiRouter);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing by returning the index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log('Available validator endpoints:');
  console.log('  POST /api/validator/setup-tracking');
  console.log('  POST /api/validator/manual-earnings');
  console.log('  POST /api/validator/expenditure');
});