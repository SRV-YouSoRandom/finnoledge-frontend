import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../services/api';
import { useTransactionNotification } from '../../hooks/useTransactionNotification';
import { 
  IconArrowLeft, 
  IconShield, 
  IconServer, 
  IconSettings,
  IconInfoCircle,
  IconCheck,
  IconExternalLink
} from '@tabler/icons-react';

function SetupValidatorTracking({ user }) {
  const navigate = useNavigate();
  const { notifyTransactionSubmitted, notifyTransactionSuccess, notifyTransactionError, extractTxHashFromResponse } = useTransactionNotification();
  
  const [formData, setFormData] = useState({
    validatorAddress: '',
    apiUrl: '',
    delegationStr: '',
    trackingMethod: 'manual' // 'manual' or 'api'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear API test result when URL changes
    if (name === 'apiUrl') {
      setApiTestResult(null);
    }
    
    if (error) setError(null);
  };

  const handleMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      trackingMethod: method,
      // Clear API-related fields when switching to manual
      ...(method === 'manual' ? { apiUrl: '' } : {})
    }));
    setApiTestResult(null);
  };

  const testApiConnection = async () => {
    if (!formData.apiUrl.trim()) {
      setError('Please enter an API URL to test');
      return;
    }

    setTestingApi(true);
    setApiTestResult(null);

    try {
      // Test the API URL
      const response = await fetch(formData.apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiTestResult({
          success: true,
          message: 'API connection successful',
          data: data
        });
      } else {
        setApiTestResult({
          success: false,
          message: `API returned ${response.status}: ${response.statusText}`
        });
      }
    } catch (err) {
      setApiTestResult({
        success: false,
        message: `Connection failed: ${err.message}`
      });
    } finally {
      setTestingApi(false);
    }
  };

  const validateForm = () => {
    if (!formData.validatorAddress.trim()) {
      setError('Validator address is required');
      return false;
    }

    // Basic validator address format validation
    if (!formData.validatorAddress.startsWith('erpvaloper')) {
      setError('Validator address should start with "erpvaloper"');
      return false;
    }

    if (formData.trackingMethod === 'api' && !formData.apiUrl.trim()) {
      setError('API URL is required for API tracking method');
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
    const loadingToastId = notifyTransactionSubmitted('Setting up validator tracking...');
    
    try {
      const response = await cli.setupValidatorTracking({
        validatorAddress: formData.validatorAddress.trim(),
        apiUrl: formData.trackingMethod === 'api' ? formData.apiUrl.trim() : '',
        delegationStr: formData.delegationStr.trim() || 'No delegation information provided',
        user
      });
      
      const txHash = extractTxHashFromResponse(response.data.data || '');
      notifyTransactionSuccess('Validator tracking setup successfully!', txHash, loadingToastId);
      
      // Success - redirect to validator overview
      navigate('/validator');
    } catch (err) {
      console.error('Error setting up validator tracking:', err);
      const errorMessage = err.response?.data?.message || 'Failed to setup validator tracking. Please try again.';
      setError(errorMessage);
      notifyTransactionError(errorMessage, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-validator-tracking">
      <div className="page-header">
        <h1>Setup Validator Tracking</h1>
        <Link to="/validator" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Overview</span>
        </Link>
      </div>
      
      <div className="card">
        {/* Information Banner */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(26, 115, 232, 0.1)',
          border: '1px solid rgba(26, 115, 232, 0.3)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <IconInfoCircle size={24} style={{ color: 'var(--primary-color)', marginTop: '2px' }} />
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                Validator Tracking Setup
              </h3>
              <p style={{ margin: '0', color: 'var(--text-color)', lineHeight: '1.5' }}>
                Set up tracking for your validator to monitor earnings, expenditures, and overall performance. 
                You can choose between manual tracking or API-based automatic tracking.
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
          {/* Validator Address */}
          <div className="form-group">
            <label htmlFor="validatorAddress" className="form-label">
              <IconShield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Validator Address *
            </label>
            <input
              type="text"
              id="validatorAddress"
              name="validatorAddress"
              className="form-input"
              value={formData.validatorAddress}
              onChange={handleChange}
              required
              placeholder="erpvaloper1..."
            />
            <span className="form-hint">
              Enter your validator's operator address (starts with "erpvaloper")
            </span>
          </div>

          {/* Tracking Method Selection */}
          <div className="form-group">
            <label className="form-label">Tracking Method *</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <div 
                className={`card ${formData.trackingMethod === 'manual' ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  border: formData.trackingMethod === 'manual' ? '2px solid #1a73e8' : '1px solid #dadce0',
                  backgroundColor: formData.trackingMethod === 'manual' ? 'rgba(26, 115, 232, 0.05)' : 'white',
                  flex: 1
                }}
                onClick={() => handleMethodChange('manual')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="trackingMethod"
                    value="manual"
                    checked={formData.trackingMethod === 'manual'}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <IconSettings size={20} style={{ color: '#1a73e8' }} />
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      Manual Tracking
                    </div>
                    <div style={{ fontSize: '14px', color: '#3c4043' }}>
                      Manually record earnings and expenditures
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`card ${formData.trackingMethod === 'api' ? 'selected' : ''}`}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer', 
                  border: formData.trackingMethod === 'api' ? '2px solid #1a73e8' : '1px solid #dadce0',
                  backgroundColor: formData.trackingMethod === 'api' ? 'rgba(26, 115, 232, 0.05)' : 'white',
                  flex: 1
                }}
                onClick={() => handleMethodChange('api')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="trackingMethod"
                    value="api"
                    checked={formData.trackingMethod === 'api'}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <IconServer size={20} style={{ color: '#1a73e8' }} />
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      API Tracking
                    </div>
                    <div style={{ fontSize: '14px', color: '#3c4043' }}>
                      Automatic tracking via API endpoint
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API URL (only shown when API tracking is selected) */}
          {formData.trackingMethod === 'api' && (
            <div className="form-group">
              <label htmlFor="apiUrl" className="form-label">
                <IconServer size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                API URL *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  id="apiUrl"
                  name="apiUrl"
                  className="form-input"
                  value={formData.apiUrl}
                  onChange={handleChange}
                  required={formData.trackingMethod === 'api'}
                  placeholder="https://api.yourvalidator.com/status"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={testApiConnection}
                  disabled={testingApi || !formData.apiUrl.trim()}
                  className="button button-secondary"
                  style={{ minWidth: '100px' }}
                >
                  {testingApi ? 'Testing...' : 'Test API'}
                </button>
              </div>
              <span className="form-hint">
                Enter the API endpoint that provides your validator status and earnings information
              </span>
              
              {/* API Test Result */}
              {apiTestResult && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: apiTestResult.success ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
                  border: `1px solid ${apiTestResult.success ? '#34a853' : '#ea4335'}`,
                  fontSize: '14px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: apiTestResult.success ? '#137333' : '#c5221f'
                  }}>
                    {apiTestResult.success ? (
                      <IconCheck size={16} />
                    ) : (
                      <IconExternalLink size={16} />
                    )}
                    <span style={{ fontWeight: '500' }}>
                      {apiTestResult.message}
                    </span>
                  </div>
                  {apiTestResult.success && apiTestResult.data && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#137333' }}>
                      API response received successfully. Data structure looks valid.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delegation Information */}
          <div className="form-group">
            <label htmlFor="delegationStr" className="form-label">
              Delegation Information
            </label>
            <textarea
              id="delegationStr"
              name="delegationStr"
              className="form-input"
              value={formData.delegationStr}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., 1000000stake self-delegated, additional delegations from community"
            />
            <span className="form-hint">
              Optional: Provide information about your validator's delegation setup
            </span>
          </div>

          {/* Method-specific Information */}
          <div style={{
            padding: '16px',
            backgroundColor: formData.trackingMethod === 'api' ? 'rgba(52, 168, 83, 0.05)' : 'rgba(251, 188, 4, 0.05)',
            border: `1px solid ${formData.trackingMethod === 'api' ? 'rgba(52, 168, 83, 0.2)' : 'rgba(251, 188, 4, 0.2)'}`,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              color: formData.trackingMethod === 'api' ? '#34a853' : '#856404' 
            }}>
              {formData.trackingMethod === 'api' ? '🔗 API Tracking Method' : '📝 Manual Tracking Method'}
            </h4>
            <div style={{ 
              fontSize: '14px', 
              color: formData.trackingMethod === 'api' ? '#137333' : '#856404',
              lineHeight: '1.4'
            }}>
              {formData.trackingMethod === 'api' ? (
                <ul style={{ margin: '0', paddingLeft: '16px' }}>
                  <li>The system will periodically query your API endpoint for earnings data</li>
                  <li>Ensure your API returns valid JSON with validator status information</li>
                  <li>You can still manually record expenditures and additional earnings</li>
                  <li>API should be accessible and return consistent data format</li>
                </ul>
              ) : (
                <ul style={{ margin: '0', paddingLeft: '16px' }}>
                  <li>You'll need to manually record all earnings and expenditures</li>
                  <li>Use the "Record Earnings" and "Record Expenditure" features</li>
                  <li>This gives you full control over what gets tracked</li>
                  <li>Perfect for validators with custom tracking needs</li>
                </ul>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              <IconShield size={16} />
              {loading ? 'Setting up...' : 'Setup Validator Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetupValidatorTracking;