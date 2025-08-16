import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { 
  IconArrowLeft, 
  IconTrendingDown,
  IconCoin,
  IconServer,
  IconSettings,
  IconAlertTriangle
} from '@tabler/icons-react';

function RecordExpenditure({ user }) {
  const navigate = useNavigate();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    expenditureType: 'server_costs' // predefined types for easier categorization
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const expenditureTypes = [
    { value: 'server_costs', label: 'Server Costs', description: 'Hosting, VPS, dedicated server costs', icon: IconServer },
    { value: 'infrastructure', label: 'Infrastructure', description: 'Network, bandwidth, storage costs', icon: IconSettings },
    { value: 'maintenance', label: 'Maintenance', description: 'System updates, monitoring tools', icon: IconSettings },
    { value: 'delegation_fees', label: 'Delegation Fees', description: 'Fees paid for delegation services', icon: IconCoin },
    { value: 'marketing', label: 'Marketing', description: 'Promotional activities, advertising', icon: IconAlertTriangle },
    { value: 'other', label: 'Other', description: 'Other validator-related expenses', icon: IconAlertTriangle }
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

  const handleExpenditureTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      expenditureType: type
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
    const loadingToastId = notifyTransactionSubmitted('Recording expenditure...');
    
    try {
      // Get the selected expenditure type details
      const selectedType = expenditureTypes.find(type => type.value === formData.expenditureType);
      const fullDescription = `[${selectedType.label}] ${formData.description.trim()}`;
      
      const response = await cli.recordExpenditure({
        amount: parseInt(formData.amount),
        description: fullDescription,
        user
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess('Expenditure recorded successfully!', txHash, loadingToastId);
      
      // Success - redirect to validator overview
      navigate('/validator');
    } catch (err) {
      console.error('Error recording expenditure:', err);
      const errorMessage = err.response?.data?.message || 'Failed to record expenditure. Please try again.';
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
    <div className="record-expenditure">
      <div className="page-header">
        <h1>Record Expenditure</h1>
        <Link to="/validator" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Overview</span>
        </Link>
      </div>
      
      <div className="card">
        {/* Information Banner */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(234, 67, 53, 0.1)',
          border: '1px solid rgba(234, 67, 53, 0.3)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconTrendingDown size={20} style={{ color: '#ea4335' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#ea4335' }}>
                Record Validator Expenditure
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#c5221f' }}>
                Track your validator operating costs including server expenses, infrastructure, and maintenance.
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
          {/* Expenditure Type Selection */}
          <div className="form-group">
            <label className="form-label">
              <IconSettings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Expenditure Type *
            </label>
            <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
              {expenditureTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <div 
                    key={type.value}
                    className={`card ${formData.expenditureType === type.value ? 'selected' : ''}`}
                    style={{ 
                      padding: '12px 16px', 
                      cursor: 'pointer', 
                      border: formData.expenditureType === type.value ? '2px solid #ea4335' : '1px solid #dadce0',
                      backgroundColor: formData.expenditureType === type.value ? 'rgba(234, 67, 53, 0.05)' : 'white'
                    }}
                    onClick={() => handleExpenditureTypeChange(type.value)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="expenditureType"
                        value={type.value}
                        checked={formData.expenditureType === type.value}
                        onChange={(e) => handleExpenditureTypeChange(e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <IconComponent size={16} style={{ color: '#ea4335' }} />
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
                );
              })}
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
              placeholder="Enter expenditure amount"
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
              placeholder="Describe this expenditure (e.g., Monthly server hosting, Bandwidth upgrade, etc.)"
            />
            <span className="form-hint">
              Provide details about what this expenditure covers and the time period
            </span>
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(234, 67, 53, 0.05)',
              border: '1px solid rgba(234, 67, 53, 0.2)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ea4335' }}>
                📊 Expenditure Preview
              </h4>
              <div style={{ fontSize: '14px', color: '#c5221f' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Type:</strong> {expenditureTypes.find(t => t.value === formData.expenditureType)?.label}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Amount:</strong> -{formatAmount(formData.amount)} stake
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Description:</strong> {formData.description}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: '0.8' }}>
                  <strong>Full Record:</strong> [{expenditureTypes.find(t => t.value === formData.expenditureType)?.label}] {formData.description}
                </div>
              </div>
            </div>
          )}

          {/* Cost Management Tips */}
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(251, 188, 4, 0.1)',
            border: '1px solid rgba(251, 188, 4, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
              💡 Cost Management Tips
            </h4>
            <div style={{ fontSize: '14px', color: '#856404', lineHeight: '1.4' }}>
              <ul style={{ margin: '0', paddingLeft: '16px' }}>
                <li>Track all validator-related expenses for accurate profitability analysis</li>
                <li>Regular monitoring helps identify cost optimization opportunities</li>
                <li>Consider the validator's commission structure when evaluating ROI</li>
                <li>Keep receipts and documentation for potential tax purposes</li>
              </ul>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
              style={{ backgroundColor: '#ea4335', borderColor: '#ea4335' }}
            >
              <IconTrendingDown size={16} />
              {loading ? 'Recording...' : 'Record Expenditure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordExpenditure;