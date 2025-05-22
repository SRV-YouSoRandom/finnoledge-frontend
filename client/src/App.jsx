import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GroupList from './pages/Groups/GroupList';
import GroupDetails from './pages/Groups/GroupDetails';
import CreateGroup from './pages/Groups/CreateGroup';
import LedgerList from './pages/Ledgers/LedgerList';
import LedgerDetails from './pages/Ledgers/LedgerDetails';
import CreateLedger from './pages/Ledgers/CreateLedger';
import JournalEntryList from './pages/JournalEntries/JournalEntryList';
import JournalEntryDetails from './pages/JournalEntries/JournalEntryDetails';
import CreateJournalEntry from './pages/JournalEntries/CreateJournalEntry';
import SendAndRecord from './pages/Transactions/SendAndRecord';
import BalanceSheet from './pages/Reports/BalanceSheet';
import ProfitAndLoss from './pages/Reports/ProfitAndLoss';
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