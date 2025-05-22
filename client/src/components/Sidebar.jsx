import { NavLink } from 'react-router-dom';
import { 
  IconDashboard, 
  IconFolders, 
  IconList, 
  IconNotes, 
  IconCoin, 
  IconPlus,
  IconReport,
  IconFileText
} from '@tabler/icons-react';
import './Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>FinnoLedge</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Chart of Accounts</li>
          <li>
            <NavLink to="/groups" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconFolders size={20} />
              <span>Account Groups</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/ledgers" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconList size={20} />
              <span>Ledger Accounts</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Transactions</li>
          <li>
            <NavLink to="/journal-entries" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconNotes size={20} />
              <span>Journal Entries</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/send-and-record" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconCoin size={20} />
              <span>Send & Record</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Reports</li>
          <li>
            <NavLink to="/balance-sheet" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconReport size={20} />
              <span>Balance Sheet</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profit-and-loss" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconFileText size={20} />
              <span>P&L Statement</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Create New</li>
          <li>
            <NavLink to="/create-group" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>New Group</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/create-ledger" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>New Ledger</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/create-journal-entry" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>New Journal Entry</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;