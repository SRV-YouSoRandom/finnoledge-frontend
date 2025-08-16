import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { 
  IconArrowLeft, 
  IconTrendingUp,
  IconCoin,
  IconCalendar,
  IconNotes
} from '@tabler/icons-react';

function RecordManualEarnings({ user }) {
  const navigate = useNavigate();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    earningsType: 'staking_rewards' // predefined types for easier categorization
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const earningsTypes = [
    { value: 'staking_rewards', label: 'Staking Rewards', description: 'Regular validator staking rewards' },
    { value: 'commission', label: 'Commission', description: 'Commission from delegator rewards' },
    { value: 'bonus', label: 'Bonus Rewards', description: 'Special bonuses or incentives' },
    { value: 'airdrop', label: 'Airdrop', description: 'Token airdrops received' },
    { value: 'other', label: 'Other', description: 'Other types of earnings' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for amount field
    if (name === 'amount' && value && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError(null);
  };

  const handleEarningsTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      earningsType: type
    }));
  };

  const validateForm = () => {
    if (!formData.amount.trim()) {
      setError('Amount is required');
      return false;
    }

    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (formData.description.trim().length < 3) {
      setError('Description must be at least 3 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const loadingToastId = notifyTransactionSubmitted('Recording manual earnings...');
    
    try {
      // Get the selected earnings type details
      const selectedType = earningsTypes.find(type => type.value === formData.earningsType);
      const fullDescription = `[${selectedType.label}] ${formData.description.trim()}`;
      
      const response = await cli.recordManualEarnings({
        amount: parseInt(formData.amount),
        description: fullDescription,
        user
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess('Manual earnings recorded successfully!', txHash, loadingToastId);
      
      // Success - redirect to validator overview
      navigate('/validator');
    } catch (err) {
      console.error('Error recording manual earnings:', err);
      const errorMessage = err.response?.data?.message || 'Failed to record manual earnings. Please try again.';
      setError(errorMessage);
      notifyTransactionError(errorMessage, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="record-manual-earnings">
      <div className="page-header">
        <h1>Record Manual Earnings</h1>
        <Link to="/validator" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Overview</span>
        </Link>
      </div>
      
      <div className="card">
        {/* Information Banner */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(52, 168, 83, 0.1)',
          border: '1px solid rgba(52, 168, 83, 0.3)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconTrendingUp size={20} style={{ color: '#34a853' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#34a853' }}>
                Record Validator Earnings
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#137333' }}>
                Manually record earnings from staking rewards, commissions, or other validator-related income.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Earnings Type Selection */}
          <div className="form-group">
            <label className="form-label">
              <IconNotes size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Earnings Type *
            </label>
            <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
              {earningsTypes.map(type => (
                <div 
                  key={type.value}
                  className={`card ${formData.earningsType === type.value ? 'selected' : ''}`}
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer', 
                    border: formData.earningsType === type.value ? '2px solid #34a853' : '1px solid #dadce0',
                    backgroundColor: formData.earningsType === type.value ? 'rgba(52, 168, 83, 0.05)' : 'white'
                  }}
                  onClick={() => handleEarningsTypeChange(type.value)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="radio"
                      name="earningsType"
                      value={type.value}
                      checked={formData.earningsType === type.value}
                      onChange={(e) => handleEarningsTypeChange(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <IconCoin size={16} style={{ color: '#34a853' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                        {type.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#3c4043' }}>
                        {type.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              <IconCoin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Amount (stake) *
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter earnings amount"
              style={{ fontSize: '16px', fontWeight: '500' }}
            />
            <span className="form-hint">
              {formData.amount && `Formatted: ${formatAmount(formData.amount)} stake`}
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe the source of these earnings (e.g., Weekly staking rewards, Delegation commission, etc.)"
            />
            <span className="form-hint">
              Provide details about the source and period of these earnings
            </span>
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(52, 168, 83, 0.05)',
              border: '1px solid rgba(52, 168, 83, 0.2)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#34a853' }}>
                📊 Earnings Preview
              </h4>
              <div style={{ fontSize: '14px', color: '#137333' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Type:</strong> {earningsTypes.find(t => t.value === formData.earningsType)?.label}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Amount:</strong> {formatAmount(formData.amount)} stake
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Description:</strong> {formData.description}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: '0.8' }}>
                  <strong>Full Record:</strong> [{earningsTypes.find(t => t.value === formData.earningsType)?.label}] {formData.description}
                </div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
              style={{ backgroundColor: '#34a853', borderColor: '#34a853' }}
            >
              <IconTrendingUp size={16} />
              {loading ? 'Recording...' : 'Record Earnings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordManualEarnings;