import { NavLink } from 'react-router-dom';
import { 
  IconDashboard, 
  IconFolders, 
  IconList, 
  IconNotes, 
  IconCoin, 
  IconPlus,
  IconReport,
  IconFileText,
  IconPackage,
  IconTrendingUp
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
          
          <li className="sidebar-section">Inventory</li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPackage size={20} />
              <span>Products</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/stock-movements" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconTrendingUp size={20} />
              <span>Stock Movements</span>
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
          <li>
            <NavLink to="/create-product" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>New Product</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/record-stock-movement" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>Record Movement</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;