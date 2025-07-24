import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

// Groups
import GroupList from './pages/Groups/GroupList';
import GroupDetails from './pages/Groups/GroupDetails';
import CreateGroup from './pages/Groups/CreateGroup';

// Ledgers
import LedgerList from './pages/Ledgers/LedgerList';
import LedgerDetails from './pages/Ledgers/LedgerDetails';
import CreateLedger from './pages/Ledgers/CreateLedger';

// Journal Entries
import JournalEntryList from './pages/JournalEntries/JournalEntryList';
import JournalEntryDetails from './pages/JournalEntries/JournalEntryDetails';
import CreateJournalEntry from './pages/JournalEntries/CreateJournalEntry';

// Transactions
import SendAndRecord from './pages/Transactions/SendAndRecord';

// Inventory
import ProductList from './pages/Inventory/ProductList';
import ProductDetails from './pages/Inventory/ProductDetails';
import CreateProduct from './pages/Inventory/CreateProduct';
import StockMovementList from './pages/Inventory/StockMovementList';
import RecordStockMovement from './pages/Inventory/RecordStockMovement';
import StockOverview from './pages/Inventory/StockOverview';
import StockMovementDetails from './pages/Inventory/StockMovementDetails';

// Reports
import BalanceSheet from './pages/Reports/BalanceSheet';
import ProfitAndLoss from './pages/Reports/ProfitAndLoss';

// HR
import HRDashboard from './pages/HR/HRDashboard';
import OfferLetterList from './pages/HR/OfferLetters/OfferLetterList';
import OfferLetterDetails from './pages/HR/OfferLetters/OfferLetterDetails';
import CreateOfferLetter from './pages/HR/OfferLetters/CreateOfferLetter';
import EmployeeList from './pages/HR/Employees/EmployeeList';
import EmployeeDetails from './pages/HR/Employees/EmployeeDetails';
import AcceptOffer from './pages/HR/Employees/AcceptOffer';
import AssignRole from './pages/HR/Employees/AssignRole';
import RoleList from './pages/HR/Roles/RoleList';
import RoleDetails from './pages/HR/Roles/RoleDetails';
import CreateRole from './pages/HR/Roles/CreateRole';
import LeaveRequestList from './pages/HR/LeaveRequests/LeaveRequestList';
import LeaveRequestDetails from './pages/HR/LeaveRequests/LeaveRequestDetails';
import CreateLeaveRequest from './pages/HR/LeaveRequests/CreateLeaveRequest';
import ProcessLeaveRequest from './pages/HR/LeaveRequests/ProcessLeaveRequest';

import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('bob'); // Default user for simplicity

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={walletAddress} />} />
            
            {/* Group Routes */}
            <Route path="/groups" element={<GroupList />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/create-group" element={<CreateGroup user={walletAddress} />} />
            
            {/* Ledger Routes */}
            <Route path="/ledgers" element={<LedgerList />} />
            <Route path="/ledgers/:id" element={<LedgerDetails />} />
            <Route path="/create-ledger" element={<CreateLedger user={walletAddress} />} />
            
            {/* Journal Entry Routes */}
            <Route path="/journal-entries" element={<JournalEntryList />} />
            <Route path="/journal-entries/:id" element={<JournalEntryDetails />} />
            <Route path="/create-journal-entry" element={<CreateJournalEntry user={walletAddress} />} />
            
            {/* Transaction Routes */}
            <Route path="/send-and-record" element={<SendAndRecord user={walletAddress} />} />

            {/* Inventory Routes */}
            <Route path="/stock-overview" element={<StockOverview />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/create-product" element={<CreateProduct user={walletAddress} />} />
            <Route path="/stock-movements" element={<StockMovementList />} />
            <Route path="/record-stock-movement" element={<RecordStockMovement user={walletAddress} />} />
            <Route path="/stock-movements/:id" element={<StockMovementDetails />} />

            {/* HR Routes */}
            <Route path="/hr" element={<HRDashboard user={walletAddress} />} />
            <Route path="/hr/offer-letters" element={<OfferLetterList />} />
            <Route path="/hr/offer-letters/:id" element={<OfferLetterDetails />} />
            <Route path="/hr/create-offer-letter" element={<CreateOfferLetter user={walletAddress} />} />
            <Route path="/hr/employees" element={<EmployeeList />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
            <Route path="/hr/assign-role/:employeeId" element={<AssignRole user={walletAddress} />} />
            <Route path="/hr/accept-offer/:offerId" element={<AcceptOffer user={walletAddress} />} />
            <Route path="/hr/roles" element={<RoleList />} />
            <Route path="/hr/roles/:id" element={<RoleDetails />} />
            <Route path="/hr/create-role" element={<CreateRole user={walletAddress} />} />
            <Route path="/hr/leave-requests" element={<LeaveRequestList />} />
            <Route path="/hr/leave-requests/:id" element={<LeaveRequestDetails />} />
            <Route path="/hr/create-leave-request" element={<CreateLeaveRequest user={walletAddress} />} />
            <Route path="/hr/process-leave-request/:requestId" element={<ProcessLeaveRequest user={walletAddress} />} />

            {/* Reports */}
            <Route path="/balance-sheet" element={<BalanceSheet />} />
            <Route path="/profit-and-loss" element={<ProfitAndLoss />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;