import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { 
  IconUser, 
  IconCalendarTime, 
  IconPlus,
  IconClock,
  IconCheck,
  IconX
} from '@tabler/icons-react';

function EmployeeDashboard() {
  const { user, updateEmployeeData } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Update employee data
        await updateEmployeeData();
        
        // Fetch leave requests for this employee
        if (user?.employeeData?.id) {
          const leaveResponse = await api.fetchLeaveRequests();
          const allLeaveRequests = leaveResponse.data.LeaveRequest || [];
          const employeeLeaveRequests = allLeaveRequests.filter(request => 
            request.employeeId.toString() === user.employeeData.id.toString()
          );
          setLeaveRequests(employeeLeaveRequests);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have user data
    if (user?.employeeData?.id) {
      fetchEmployeeData();
    } else {
      setLoading(false);
    }
  }, [user?.employeeData?.id]); // Fixed: Removed updateEmployeeData from dependencies

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'badge-warning',
      'Approved': 'badge-success',
      'Rejected': 'badge-error'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge-info'}`}>
        {status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <IconCheck size={16} style={{ color: '#34a853' }} />;
      case 'Rejected':
        return <IconX size={16} style={{ color: '#ea4335' }} />;
      case 'Pending':
      default:
        return <IconClock size={16} style={{ color: '#fbbc04' }} />;
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const recentLeaveRequests = leaveRequests.slice(0, 5);
  const pendingRequests = leaveRequests.filter(req => req.status === 'Pending').length;
  const approvedRequests = leaveRequests.filter(req => req.status === 'Approved').length;

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  // Show message if no user data
  if (!user?.employeeData) {
    return (
      <div className="error-state">
        Unable to load employee data. Please try logging in again.
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      <div className="page-header">
        <h1>My Dashboard</h1>
      </div>
      
      {/* Welcome Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconUser size={48} style={{ color: 'var(--primary-color)' }} />
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
              Welcome, {user.employeeData.name}!
            </h2>
            <div style={{ color: 'var(--secondary-color)' }}>
              <div>Employee ID: <strong>{user.employeeData.employeeId}</strong></div>
              <div>Position: <strong>{user.employeeData.position}</strong></div>
              <div>Department: <strong>{user.employeeData.department || 'Not Assigned'}</strong></div>
              <div>Role: <strong>{user.employeeData.role}</strong></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-summary">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCalendarTime size={20} />
                <span>Total Leave Requests</span>
              </h2>
            </div>
            <div className="balance-display">{leaveRequests.length}</div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconClock size={20} />
                <span>Pending Requests</span>
              </h2>
            </div>
            <div className="balance-display" style={{ color: '#fbbc04' }}>
              {pendingRequests}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCheck size={20} />
                <span>Approved Requests</span>
              </h2>
            </div>
            <div className="balance-display" style={{ color: '#34a853' }}>
              {approvedRequests}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="button-group" style={{flexDirection: 'column', gap: '12px'}}>
            <Link to="/employee/apply-leave" className="button">
              <IconPlus size={16} />
              <span>Apply for Leave</span>
            </Link>
            <Link to="/employee/leave-requests" className="button button-secondary">
              <IconCalendarTime size={16} />
              <span>View All Leave Requests</span>
            </Link>
            <Link to="/employee/profile" className="button button-secondary">
              <IconUser size={16} />
              <span>View My Profile</span>
            </Link>
          </div>
        </div>
        
        {/* Recent Leave Requests */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconCalendarTime size={20} />
              <span>Recent Leave Requests</span>
            </h2>
            <Link to="/employee/leave-requests" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {recentLeaveRequests.length > 0 ? (
              recentLeaveRequests.map(request => (
                <div key={request.id} className="list-item">
                  <div className="list-item-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(request.status)}
                      <span>{request.startDate} to {request.endDate}</span>
                    </div>
                  </div>
                  <div className="list-item-subtitle">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{request.reason}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{calculateDuration(request.startDate, request.endDate)} days</span>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                No leave requests found.
                <div style={{ marginTop: '16px' }}>
                  <Link to="/employee/apply-leave" className="button">
                    Apply for Leave
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;