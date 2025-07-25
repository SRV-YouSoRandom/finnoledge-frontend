// client/src/pages/Employee/ApplyLeave.jsx - DEBUG VERSION

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { IconArrowLeft, IconCalendarTime } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function ApplyLeave() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);
  setDebugInfo(null);

  console.log('=== APPLY LEAVE DEBUG START ===');
  console.log('User object:', user);
  console.log('Form data:', formData);

  try {
    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Date validation:');
    console.log('- startDate:', startDate);
    console.log('- endDate:', endDate);
    console.log('- today:', today);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      setSubmitting(false);
      return;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date');
      setSubmitting(false);
      return;
    }

    // Validate reason
    if (!formData.reason.trim()) {
      setError('Reason is required');
      setSubmitting(false);
      return;
    }

    if (formData.reason.trim().length < 5) {
      setError('Reason must be at least 5 characters long');
      setSubmitting(false);
      return;
    }

    const loadingToastId = notifyTransactionSubmitted('Submitting leave request...');

    // Get system ID
    const systemEmployeeId = user.systemId || user.employeeData?.id;
    
    console.log('Employee ID extraction:');
    console.log('- user.systemId:', user.systemId);
    console.log('- user.employeeData:', user.employeeData);
    console.log('- user.employeeData?.id:', user.employeeData?.id);
    console.log('- Final systemEmployeeId:', systemEmployeeId);
    
    if (systemEmployeeId === undefined || systemEmployeeId === null) {
      throw new Error('Employee system ID not found. Please log out and log back in.');
    }
    
    // Prepare request data
    const requestData = {
      employeeId: parseInt(systemEmployeeId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason.trim(),
      user: user.walletAddress || 'bob'
    };
    
    console.log('Request data prepared:');
    console.log('- Original systemEmployeeId:', systemEmployeeId);
    console.log('- Parsed employeeId:', requestData.employeeId);
    console.log('- startDate:', requestData.startDate);
    console.log('- endDate:', requestData.endDate);
    console.log('- reason length:', requestData.reason.length);
    console.log('- reason:', JSON.stringify(requestData.reason));
    console.log('- user:', requestData.user);
    console.log('- Full request data:', JSON.stringify(requestData, null, 2));
    
    // Validate all required fields before sending
    const validationErrors = [];
    if (requestData.employeeId === undefined || requestData.employeeId === null || isNaN(requestData.employeeId)) {
      validationErrors.push('Employee system ID is invalid');
    }
    if (!requestData.startDate) validationErrors.push('Start date is missing');
    if (!requestData.endDate) validationErrors.push('End date is missing');
    if (!requestData.reason) validationErrors.push('Reason is missing');
    if (!requestData.user) validationErrors.push('User is missing');
    
    if (validationErrors.length > 0) {
      throw new Error('Validation failed: ' + validationErrors.join(', '));
    }
    
    console.log('Sending request to API...');
    
    const response = await cli.submitLeaveRequest(requestData);
    
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
      notifyTransactionSuccess('Leave request submitted successfully!', txHash, loadingToastId);
      
      toast.success('Leave request submitted! You will be redirected to your requests.', {
        duration: 3000
      });
      
      setTimeout(() => {
        navigate('/employee/leave-requests');
      }, 1500);
    } else {
      throw new Error(response.data.message || 'Unknown error occurred');
    }
    
  } catch (err) {
    console.error('=== APPLY LEAVE ERROR ===');
    console.error('Error object:', err);
    console.error('Error message:', err.message);
    console.error('Error response:', err.response);
    
    let errorMessage = 'Failed to submit leave request. Please try again.';
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

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
    }
    return 0;
  };

  const today = new Date().toISOString().split('T')[0];

  if (!user || !user.employeeData) {
    return (
      <div className="apply-leave">
        <div className="page-header">
          <h1>Apply for Leave</h1>
          <Link to="/employee/leave-requests" className="button button-secondary">
            <IconArrowLeft size={16} />
            <span>Back to My Requests</span>
          </Link>
        </div>
        <div className="card">
          <div className="error-message">
            Employee data not found. Please log out and log back in.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-leave">
      <div className="page-header">
        <h1>Apply for Leave</h1>
        <Link to="/employee/leave-requests" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to My Requests</span>
        </Link>
      </div>
      
      <div className="card">
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(26, 115, 232, 0.05)', borderRadius: '8px', border: '1px solid rgba(26, 115, 232, 0.2)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
            Employee Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
            <div><strong>Name:</strong> {user?.employeeData?.name}</div>
            <div><strong>HR Employee ID:</strong> {user?.employeeData?.employeeId}</div>
            <div><strong>System ID (Login ID):</strong> <code style={{ backgroundColor: 'rgba(26, 115, 232, 0.1)', padding: '2px 4px', borderRadius: '3px', fontWeight: '600' }}>{user?.systemId || user?.employeeData?.id}</code></div>
            <div><strong>Department:</strong> {user?.employeeData?.department || 'Not Assigned'}</div>
            <div><strong>Position:</strong> {user?.employeeData?.position}</div>
          </div>
        </div>

        {/* Debug Information Display */}
        {debugInfo && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dadce0' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Debug Information</h4>
            <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto', backgroundColor: '#fff', padding: '12px', borderRadius: '4px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={today}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || today}
              />
            </div>
          </div>
          
          {calculateDuration() > 0 && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(52, 168, 83, 0.1)',
              border: '1px solid rgba(52, 168, 83, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconCalendarTime size={20} style={{ color: '#34a853' }} />
                <span style={{ fontWeight: '500', color: '#34a853' }}>
                  Leave Duration: {calculateDuration()} day{calculateDuration() > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason for Leave *</label>
            <textarea
              id="reason"
              name="reason"
              className="form-input"
              value={formData.reason}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Please provide the reason for your leave request (e.g., Personal emergency, Medical appointment, Vacation, etc.)"
              minLength="5"
            />
            <span className="form-hint">
              Please provide a clear and detailed reason for your leave request (minimum 5 characters)
            </span>
          </div>
          
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(52, 168, 83, 0.05)', borderRadius: '8px', border: '1px solid rgba(52, 168, 83, 0.2)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#34a853' }}>Request Preview</h4>
            <div style={{ fontSize: '14px', color: '#137333' }}>
              <div><strong>Employee System ID:</strong> {user?.systemId || user?.employeeData?.id}</div>
              <div><strong>Leave Period:</strong> {formData.startDate || 'Not selected'} to {formData.endDate || 'Not selected'}</div>
              <div><strong>Duration:</strong> {calculateDuration()} day{calculateDuration() > 1 ? 's' : ''}</div>
              <div><strong>Reason:</strong> {formData.reason || 'Not provided'}</div>
              <div><strong>Command Preview:</strong></div>
              <code style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px', borderRadius: '4px', display: 'block', marginTop: '4px' }}>
                rollkit tx hr submit-leave-request {user?.systemId || user?.employeeData?.id} "{formData.startDate}" "{formData.endDate}" "{formData.reason.trim()}"
              </code>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              <IconCalendarTime size={16} />
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;