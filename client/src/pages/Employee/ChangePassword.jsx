import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { IconArrowLeft, IconKey, IconEye, IconEyeOff } from '@tabler/icons-react';

function ChangePassword() {
  const { user } = useAuth();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate passwords
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    const toastId = notifyTransactionSubmitted('Changing password...');

    try {
      const response = await cli.changePassword({
        employeeId: parseInt(user.employeeData.id),
        newPassword: formData.newPassword,
        user: user.walletAddress
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess('Password changed successfully!', txHash);
      
      setSuccess(true);
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      notifyTransactionError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-password">
      <div className="page-header">
        <h1>Change Password</h1>
        <Link to="/employee/profile" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Profile</span>
        </Link>
      </div>
      
      <div className="card">
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(26, 115, 232, 0.05)', borderRadius: '8px', border: '1px solid rgba(26, 115, 232, 0.2)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
            Account Information
          </h3>
          <div style={{ fontSize: '14px' }}>
            <div><strong>Employee:</strong> {user?.employeeData?.name}</div>
            <div><strong>Employee ID:</strong> {user?.employeeData?.employeeId}</div>
            <div><strong>Login Address:</strong> <code>{user?.walletAddress}</code></div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(52, 168, 83, 0.1)',
            border: '1px solid rgba(52, 168, 83, 0.3)',
            color: '#137333',
            padding: '14px',
            borderRadius: 'var(--border-radius)',
            marginBottom: '20px'
          }}>
            ✓ Password changed successfully! You can now use your new password for future logins.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              <IconKey size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              New Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className="form-input"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter your new password"
                style={{ paddingRight: '40px' }}
                minLength="6"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary-color)',
                  padding: '4px'
                }}
              >
                {showPasswords.new ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            <span className="form-hint">
              Password must be at least 6 characters long
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <IconKey size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Confirm New Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your new password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary-color)',
                  padding: '4px'
                }}
              >
                {showPasswords.confirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            <span className="form-hint">
              Re-enter your new password to confirm
            </span>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              <IconKey size={16} />
              {submitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;