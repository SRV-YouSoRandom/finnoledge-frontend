import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconPlus, IconCalendarTime, IconCheck, IconX } from '@tabler/icons-react';

function LeaveRequestList() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await api.fetchLeaveRequests();
        setLeaveRequests(response.data.LeaveRequest || []);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);

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

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  if (loading) {
    return <div className="loading">Loading leave requests...</div>;
  }

  return (
    <div className="leave-request-list">
      <div className="page-header">
        <h1>Leave Requests</h1>
        <Link to="/hr/create-leave-request" className="button">
          <IconPlus size={16} />
          <span>Submit Leave Request</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map(request => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>
                  <code style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {request.employeeId}
                  </code>
                </td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>
                  <span style={{ fontWeight: '500' }}>
                    {calculateDuration(request.startDate, request.endDate)} days
                  </span>
                </td>
                <td>{request.reason}</td>
                <td>{getStatusBadge(request.status)}</td>
                <td>
                  <div className="button-group">
                    <Link to={`/hr/leave-requests/${request.id}`} className="button button-secondary">
                      View
                    </Link>
                    {request.status === 'Pending' && (
                      <>
                        <Link 
                          to={`/hr/process-leave-request/${request.id}?action=approve`} 
                          className="button"
                          style={{ backgroundColor: '#34a853' }}
                        >
                          <IconCheck size={14} />
                          Approve
                        </Link>
                        <Link 
                          to={`/hr/process-leave-request/${request.id}?action=reject`} 
                          className="button"
                          style={{ backgroundColor: '#ea4335' }}
                        >
                          <IconX size={14} />
                          Reject
                        </Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {leaveRequests.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-state">
                  No leave requests found. Submit your first leave request using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveRequestList;