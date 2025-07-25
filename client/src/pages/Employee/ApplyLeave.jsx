import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { IconArrowLeft, IconCalendarTime } from '@tabler/icons-react';

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

    const toastId = notifyTransactionSubmitted('Submitting leave request...');

    try {
      const response = await cli.submitLeaveRequest({
        employeeId: parseInt(user.employeeData.id),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        user: user.walletAddress
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess('Leave request submitted successfully!', txHash);
      
      // Success - redirect to leave requests list
      navigate('/employee/leave-requests');
    } catch (err) {
      console.error('Error submitting leave request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit leave request. Please try again.';
      setError(errorMessage);
      notifyTransactionError(errorMessage);
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
            <div><strong>Department:</strong> {user?.employeeData?.department || 'Not Assigned'}</div>
            <div><strong>Position:</strong> {user?.employeeData?.position}</div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
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
            />
            <span className="form-hint">
              Please provide a clear and detailed reason for your leave request
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