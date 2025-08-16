// client/src/components/AdminSidebar.jsx - Updated with Validator section
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  IconTrendingUp,
  IconClipboardList,
  IconUsers,
  IconUserPlus,
  IconBriefcase,
  IconCalendarTime,
  IconLogout,
  IconUser,
  IconShield,
  IconSettings,
  IconTrendingDown
} from '@tabler/icons-react';
import './Sidebar.css';

function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Verinet ERP</h2>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)',
          marginTop: '4px'
        }}>
          Admin Panel
        </div>
      </div>

      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconUser size={16} />
          <span>{user?.walletAddress}</span>
        </div>
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
            <NavLink to="/stock-overview" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconClipboardList size={20} />
              <span>Stock Overview</span>
            </NavLink>
          </li>
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
          
          {/* NEW VALIDATOR SECTION */}
          <li className="sidebar-section">Validator Tracking</li>
          <li>
            <NavLink to="/validator" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconShield size={20} />
              <span>Validator Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/validator/list" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconList size={20} />
              <span>All Validators</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/validator/record-earnings" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconTrendingUp size={20} />
              <span>Record Earnings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/validator/record-expenditure" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconTrendingDown size={20} />
              <span>Record Expenditure</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Human Resources</li>
          <li>
            <NavLink to="/hr" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconUsers size={20} />
              <span>HR Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/offer-letters" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconFileText size={20} />
              <span>Offer Letters</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/employees" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconUsers size={20} />
              <span>Employees</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/roles" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconBriefcase size={20} />
              <span>Roles</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/leave-requests" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconCalendarTime size={20} />
              <span>Leave Requests</span>
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
          
          <li className="sidebar-section">Quick Actions</li>
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
            <NavLink to="/validator/setup" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>Setup Validator</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/create-offer-letter" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>New Offer Letter</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Account</li>
          <li>
            <button 
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
                color: 'var(--sidebar-text)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                borderLeft: '3px solid transparent'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderLeftColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderLeftColor = 'transparent';
              }}
            >
              <IconLogout size={20} />
              <span style={{ marginLeft: '12px' }}>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;