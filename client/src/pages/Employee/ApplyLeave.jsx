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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);

  // Validate dates
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  try {
    // Get the system ID for this employee
    // The systemId is the blockchain-generated ID that CLI commands expect
    const systemEmployeeId = user.systemId || user.employeeData?.id;
    
    if (systemEmployeeId === undefined || systemEmployeeId === null) {
      throw new Error('Employee system ID not found. Please log out and log back in.');
    }
    
    console.log('Submitting leave request for employee:', {
      systemId: systemEmployeeId,
      employeeData: user.employeeData,
      dates: { start: formData.startDate, end: formData.endDate },
      reason: formData.reason
    });
    
    // Prepare the request data
    const requestData = {
      employeeId: parseInt(systemEmployeeId), // Ensure it's a number
      startDate: formData.startDate, // Should be in YYYY-MM-DD format
      endDate: formData.endDate,     // Should be in YYYY-MM-DD format
      reason: formData.reason.trim(),
      user: user.walletAddress || 'bob' // Use actual wallet address
    };
    
    console.log('Sending request data:', requestData);
    
    const response = await cli.submitLeaveRequest(requestData);
    
    console.log('Leave request response:', response);
    
    const txHash = extractTxHashFromResponse(response.data.data || '');
    notifyTransactionSuccess('Leave request submitted successfully!', txHash, loadingToastId);
    
    // Show success message
    toast.success('Leave request submitted! You will be redirected to your requests.', {
      duration: 3000
    });
    
    // Wait a moment then redirect
    setTimeout(() => {
      navigate('/employee/leave-requests');
    }, 1500);
    
  } catch (err) {
    console.error('Error submitting leave request:', err);
    
    // Extract the actual error message
    let errorMessage = 'Failed to submit leave request. Please try again.';
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    console.error('Processed error message:', errorMessage);
    
    setError(errorMessage);
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

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // If user data is not available, show error
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
            <div><strong>Employee ID:</strong> {user?.employeeData?.employeeId}</div>
            <div><strong>System ID:</strong> <code style={{ backgroundColor: 'rgba(26, 115, 232, 0.1)', padding: '2px 4px', borderRadius: '3px', fontWeight: '600' }}>{user?.systemId || user?.employeeData?.id}</code></div>
            <div><strong>Department:</strong> {user?.employeeData?.department || 'Not Assigned'}</div>
            <div><strong>Position:</strong> {user?.employeeData?.position}</div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--secondary-color)' }}>
            <strong>Note:</strong> Leave requests are processed using your System ID ({user?.systemId || user?.employeeData?.id})
          </div>
        </div>

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