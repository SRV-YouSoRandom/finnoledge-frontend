import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, cli } from '../../../services/api';
import { useTransactionNotification } from '../../../hooks/useTransactionNotification';
import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';

function ProcessLeaveRequest({ user }) {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [action, setAction] = useState(searchParams.get('action') || 'approve');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchLeaveRequest(requestId);
        const leaveData = response.data.LeaveRequest;
        setLeaveRequest(leaveData);
        
        // Fetch employee details using the employeeId from leave request
        // IMPORTANT: The employeeId in leave request is the system ID (0, 1, 2...)
        try {
          const employeesResponse = await api.fetchEmployees();
          const employees = employeesResponse.data.Employee || [];
          
          // Find employee by system ID (leaveData.employeeId matches employee.id)
          const requestEmployee = employees.find(emp => 
            emp.id.toString() === leaveData.employeeId.toString()
          );
          
          if (requestEmployee) {
            setEmployee(requestEmployee);
            console.log('Found employee for leave request:', requestEmployee);
          } else {
            console.log('No employee found for system ID:', leaveData.employeeId);
          }
        } catch (employeeError) {
          console.log('Error fetching employee details:', employeeError);
          setEmployee(null);
        }
        
      } catch (error) {
        console.error('Error fetching leave request details:', error);
        setError('Failed to load leave request details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequestDetails();
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const loadingToastId = notifyTransactionSubmitted(`${action === 'approve' ? 'Approving' : 'Rejecting'} leave request...`);

    try {
      const response = await cli.processLeaveRequest({
        requestId: parseInt(requestId),
        newStatus,
        user
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess(`Leave request ${newStatus.toLowerCase()} successfully!`, txHash, loadingToastId);
      
      // Success - redirect to leave requests list
      navigate('/hr/leave-requests');
    } catch (err) {
      console.error('Error processing leave request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to process leave request. Please try again.';
      setError(errorMessage);
      notifyTransactionError(errorMessage, loadingToastId);
    } finally {
      setSubmitting(false);
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
    return <div className="loading">Loading leave request...</div>;
  }

  if (!leaveRequest) {
    return <div className="error-state">Leave request not found</div>;
  }

  if (leaveRequest.status !== 'Pending') {
    return (
      <div className="error-state">
        This leave request has already been {leaveRequest.status.toLowerCase()}.
        <div style={{ marginTop: '16px' }}>
          <Link to="/hr/leave-requests" className="button">
            Back to Leave Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="process-leave-request">
      <div className="page-header">
        <h1>Process Leave Request</h1>
        <Link to={`/hr/leave-requests/${requestId}`} className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Request Details</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-section">
          <h2>Leave Request Summary</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Request ID</div>
              <div className="detail-value">{leaveRequest.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Employee System ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--primary-color)'
                }}>
                  {leaveRequest.employeeId}
                </code>
              </div>
            </div>
            {employee && (
              <>
                <div className="detail-item">
                  <div className="detail-label">Employee Name</div>
                  <div className="detail-value" style={{ fontWeight: '600' }}>
                    {employee.name}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">HR Employee ID</div>
                  <div className="detail-value">
                    <code style={{ 
                      backgroundColor: 'rgba(0,0,0,0.05)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {employee.employeeId}
                    </code>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Department</div>
                  <div className="detail-value">{employee.department || 'Not Assigned'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Position</div>
                  <div className="detail-value">{employee.position}</div>
                </div>
              </>
            )}
            <div className="detail-item">
              <div className="detail-label">Leave Period</div>
              <div className="detail-value">
                {leaveRequest.startDate} to {leaveRequest.endDate}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Duration</div>
              <div className="detail-value" style={{ fontWeight: '600', color: '#1a73e8' }}>
                {calculateDuration(leaveRequest.startDate, leaveRequest.endDate)} days
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Reason</div>
              <div className="detail-value">{leaveRequest.reason}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Current Status</div>
              <div className="detail-value">
                <span className="badge badge-warning">Pending</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Submitted By</div>
              <div className="detail-value">{leaveRequest.creator.substring(0, 20)}...</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Process Request</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Action *</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <div 
                className={`card ${action === 'approve' ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  border: action === 'approve' ? '2px solid #34a853' : '1px solid #dadce0',
                  backgroundColor: action === 'approve' ? 'rgba(52, 168, 83, 0.05)' : 'white',
                  flex: 1
                }}
                onClick={() => setAction('approve')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <IconCheck size={20} style={{ color: '#34a853' }} />
                  <div>
                    <div style={{ fontWeight: '500', color: '#34a853' }}>
                      Approve Request
                    </div>
                    <div style={{ fontSize: '14px', color: '#3c4043' }}>
                      Grant the leave request
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`card ${action === 'reject' ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  border: action === 'reject' ? '2px solid #ea4335' : '1px solid #dadce0',
                  backgroundColor: action === 'reject' ? 'rgba(234, 67, 53, 0.05)' : 'white',
                  flex: 1
                }}
                onClick={() => setAction('reject')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <IconX size={20} style={{ color: '#ea4335' }} />
                  <div>
                    <div style={{ fontWeight: '500', color: '#ea4335' }}>
                      Reject Request
                    </div>
                    <div style={{ fontSize: '14px', color: '#3c4043' }}>
                      Deny the leave request
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
              style={{ 
                backgroundColor: action === 'approve' ? '#34a853' : '#ea4335',
                borderColor: action === 'approve' ? '#34a853' : '#ea4335'
              }}
            >
              {action === 'approve' ? <IconCheck size={16} /> : <IconX size={16} />}
              {submitting ? 'Processing...' : `${action === 'approve' ? 'Approve' : 'Reject'} Request`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProcessLeaveRequest;