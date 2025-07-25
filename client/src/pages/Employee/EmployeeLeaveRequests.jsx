import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { IconPlus, IconCalendarTime, IconCheck, IconX, IconClock } from '@tabler/icons-react';

function EmployeeLeaveRequests() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        if (user?.employeeData?.id) {
          const response = await api.fetchLeaveRequests();
          const allLeaveRequests = response.data.LeaveRequest || [];
          const employeeLeaveRequests = allLeaveRequests.filter(request => 
            request.employeeId.toString() === user.employeeData.id.toString()
          );
          setLeaveRequests(employeeLeaveRequests);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, [user?.employeeData?.id]);

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

  if (loading) {
    return <div className="loading">Loading leave requests...</div>;
  }

  return (
    <div className="employee-leave-requests">
      <div className="page-header">
        <h1>My Leave Requests</h1>
        <Link to="/employee/apply-leave" className="button">
          <IconPlus size={16} />
          <span>Apply for Leave</span>
        </Link>
      </div>
      
      <div className="card">
        {leaveRequests.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(request => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {calculateDuration(request.startDate, request.endDate)} days
                    </span>
                  </td>
                  <td>{request.reason}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
                    by {request.creator.substring(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <IconCalendarTime size={48} style={{ color: 'var(--secondary-color)', marginBottom: '16px' }} />
            <h3>No Leave Requests Yet</h3>
            <p>You haven't submitted any leave requests. Apply for your first leave below.</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/employee/apply-leave" className="button">
                <IconPlus size={16} />
                Apply for Leave
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeLeaveRequests;