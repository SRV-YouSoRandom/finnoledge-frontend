import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IconUser, IconSettings, IconBriefcase } from '@tabler/icons-react';

function EmployeeProfile() {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    const roleClasses = {
      'HR Admin': 'badge-info',
      'Employee': 'badge-success',
      'Manager': 'badge-warning'
    };
    
    return (
      <span className={`badge ${roleClasses[role] || 'badge-info'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="employee-profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <Link to="/employee/change-password" className="button">
          <IconSettings size={16} />
          <span>Change Password</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header" style={{ marginBottom: '32px' }}>
          <IconUser size={48} style={{ color: 'var(--primary-color)' }} />
          <div>
            <h1 style={{ margin: '0 0 8px 0' }}>{user?.employeeData?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getRoleBadge(user?.employeeData?.role)}
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Personal Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Employee ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {user?.employeeData?.employeeId}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value" style={{ fontWeight: '600' }}>
                {user?.employeeData?.name}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact Information</div>
              <div className="detail-value">{user?.employeeData?.contactInfo}</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Employment Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Department</div>
              <div className="detail-value">{user?.employeeData?.department || 'Not Assigned'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{user?.employeeData?.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Role</div>
              <div className="detail-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconBriefcase size={16} style={{ color: 'var(--primary-color)' }} />
                  {getRoleBadge(user?.employeeData?.role)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Account Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Login Address</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {user?.walletAddress}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Account Status</div>
              <div className="detail-value">
                <span className="badge badge-success">Active</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Last Login</div>
              <div className="detail-value">
                {user?.loginTime ? new Date(user.loginTime).toLocaleString() : 'Current session'}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Quick Actions</h2>
          <div className="button-group">
            <Link to="/employee/change-password" className="button">
              <IconSettings size={16} />
              Change Password
            </Link>
            <Link to="/employee/leave-requests" className="button button-secondary">
              View Leave Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;