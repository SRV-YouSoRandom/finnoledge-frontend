// client/src/components/EmployeeSidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  IconDashboard, 
  IconCalendarTime,
  IconUser,
  IconLogout,
  IconPlus,
  IconSettings
} from '@tabler/icons-react';
import './Sidebar.css';

function EmployeeSidebar() {
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
          Employee Portal
        </div>
      </div>

      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.1)'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          Welcome, {user?.employeeData?.name || 'Employee'}
        </div>
        <div style={{ fontSize: '11px', opacity: '0.8' }}>
          System ID: <strong>{user?.systemId || user?.employeeData?.id}</strong>
        </div>
        <div style={{ fontSize: '11px', opacity: '0.8' }}>
          Employee ID: {user?.employeeData?.employeeId}
        </div>
        <div style={{ fontSize: '11px', opacity: '0.8' }}>
          Role: {user?.employeeData?.role}
        </div>
        <div style={{ fontSize: '11px', opacity: '0.8' }}>
          Department: {user?.employeeData?.department || 'Not Assigned'}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/employee/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconDashboard size={20} />
              <span>My Dashboard</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">Leave Management</li>
          <li>
            <NavLink to="/employee/leave-requests" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconCalendarTime size={20} />
              <span>My Leave Requests</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/apply-leave" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconPlus size={20} />
              <span>Apply for Leave</span>
            </NavLink>
          </li>
          
          <li className="sidebar-section">My Profile</li>
          <li>
            <NavLink to="/employee/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconUser size={20} />
              <span>View Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/employee/change-password" className={({ isActive }) => isActive ? 'active' : ''}>
              <IconSettings size={20} />
              <span>Change Password</span>
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

export default EmployeeSidebar;