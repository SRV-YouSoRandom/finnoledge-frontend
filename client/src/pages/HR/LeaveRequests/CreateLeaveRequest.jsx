import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateLeaveRequest({ user }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.fetchEmployees();
        setEmployees(response.data.Employee || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

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

    try {
      await cli.submitLeaveRequest({
        employeeId: parseInt(formData.employeeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        user
      });
      
      // Success - redirect to leave requests list
      navigate('/hr/leave-requests');
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request. Please try again.');
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

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="create-leave-request">
      <div className="page-header">
        <h1>Submit Leave Request</h1>
        <Link to="/hr/leave-requests" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Leave Requests</span>
        </Link>
      </div>
      
      <div className="card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employeeId" className="form-label">Employee *</label>
            <select
              id="employeeId"
              name="employeeId"
              className="form-select"
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employeeId})
                </option>
              ))}
            </select>
          </div>
          
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
            <div className="form-group">
              <div className="detail-item">
                <div className="detail-label">Leave Duration</div>
                <div className="detail-value" style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#1a73e8' 
                }}>
                  {calculateDuration()} days
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason *</label>
            <textarea
              id="reason"
              name="reason"
              className="form-input"
              value={formData.reason}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Please provide the reason for your leave request"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLeaveRequest;