// client/src/pages/HR/LeaveRequests/ProcessLeaveRequest.jsx - DEBUG VERSION

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
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      try {
        setLoading(true);
        console.log('=== FETCHING LEAVE REQUEST ===');
        console.log('Request ID from params:', requestId);
        
        const response = await api.fetchLeaveRequest(requestId);
        const leaveData = response.data.LeaveRequest;
        console.log('Leave request data:', leaveData);
        setLeaveRequest(leaveData);
        
        // Fetch employee details
        try {
          const employeesResponse = await api.fetchEmployees();
          const employees = employeesResponse.data.Employee || [];
          console.log('All employees:', employees);
          
          const requestEmployee = employees.find(emp => 
            emp.id.toString() === leaveData.employeeId.toString()
          );
          console.log('Found employee for request:', requestEmployee);
          
          if (requestEmployee) {
            setEmployee(requestEmployee);
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
    setDebugInfo(null);

    console.log('=== PROCESS LEAVE REQUEST DEBUG START ===');
    console.log('URL params requestId:', requestId);
    console.log('Action:', action);
    console.log('User:', user);
    console.log('Leave request:', leaveRequest);

    try {
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const loadingToastId = notifyTransactionSubmitted(`${action === 'approve' ? 'Approving' : 'Rejecting'} leave request...`);

      // Validate requestId
      const reqId = parseInt(requestId);
      console.log('Request ID validation:');
      console.log('- Original requestId:', requestId, typeof requestId);
      console.log('- Parsed reqId:', reqId, typeof reqId);
      console.log('- isNaN(reqId):', isNaN(reqId));
      
      if (isNaN(reqId) || reqId < 0) {
        throw new Error('Invalid request ID');
      }

      // Prepare request data
      const requestData = {
        requestId: reqId,
        newStatus: newStatus,
        user: user
      };

      console.log('Request data prepared:');
      console.log('- requestId:', requestData.requestId, typeof requestData.requestId);
      console.log('- newStatus:', requestData.newStatus, typeof requestData.newStatus);
      console.log('- user:', requestData.user, typeof requestData.user);
      console.log('- Full request data:', JSON.stringify(requestData, null, 2));

      // Validate all required fields
      const validationErrors = [];
      if (requestData.requestId === undefined || requestData.requestId === null || isNaN(requestData.requestId)) {
        validationErrors.push('Request ID is invalid');
      }
      if (!requestData.newStatus) validationErrors.push('New status is missing');
      if (!requestData.user) validationErrors.push('User is missing');
      
      const validStatuses = ['Approved', 'Rejected'];
      if (!validStatuses.includes(requestData.newStatus)) {
        validationErrors.push(`Invalid status: ${requestData.newStatus}`);
      }
      
      if (validationErrors.length > 0) {
        throw new Error('Validation failed: ' + validationErrors.join(', '));
      }

      console.log('Sending request to API...');
      
      const response = await cli.processLeaveRequest(requestData);
      
      console.log('=== API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Set debug info for display
      setDebugInfo({
        requestData,
        response: response.data,
        command: response.data.debug?.command
      });
      
      if (response.data.success) {
        const txHash = extractTxHashFromResponse(response.data.data || '');
        notifyTransactionSuccess(`Leave request ${newStatus.toLowerCase()} successfully!`, txHash, loadingToastId);
        
        setTimeout(() => {
          navigate('/hr/leave-requests');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
      
    } catch (err) {
      console.error('=== PROCESS LEAVE REQUEST ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to process leave request. Please try again.';
      let debugData = null;
      
      if (err.response?.data) {
        console.log('Server response data:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
        debugData = err.response.data.debug;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDebugInfo({
        error: errorMessage,
        debugData,
        fullError: err.response?.data || err
      });
      
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
      
      {/* Debug Information Display */}
      {debugInfo && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: '#f8f9fa' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Debug Information</h4>
          <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto', backgroundColor: '#fff', padding: '12px', borderRadius: '4px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="card">
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(251, 188, 4, 0.1)', borderRadius: '8px', border: '1px solid rgba(251, 188, 4, 0.3)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#856404' }}>
            ⚠️ Processing Request ID: {requestId}
          </h3>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            <strong>Command Preview:</strong> <code>rollkit tx hr process-leave-request {requestId} "{action === 'approve' ? 'Approved' : 'Rejected'}" --from {user} --chain-id erprollup -y --fees 5stake</code>
          </div>
          <div style={{ fontSize: '12px', color: '#856404', marginTop: '8px' }}>
            <strong>Values:</strong> requestId={requestId} (type: {typeof requestId}), parsed={parseInt(requestId)} (type: {typeof parseInt(requestId)}), action={action}, newStatus={action === 'approve' ? 'Approved' : 'Rejected'}
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Leave Request Summary</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Request ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--primary-color)'
                }}>
                  {leaveRequest.id}
                </code>
              </div>
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
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Process Request</h2>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
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
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      Will set status to "Approved"
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
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      Will set status to "Rejected"
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