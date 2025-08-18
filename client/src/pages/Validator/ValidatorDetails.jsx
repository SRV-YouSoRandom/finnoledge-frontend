// client/src/pages/Validator/ValidatorDetails.jsx - SIMPLE FIX
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  IconArrowLeft, 
  IconShield, 
  IconTrendingUp, 
  IconTrendingDown,
  IconServer,
  IconSettings,
  IconAlertCircle,
  IconCheck,
  IconCoin,
  IconExternalLink,
  IconRefresh
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function ValidatorDetails() {
  const { owner } = useParams();
  const [validator, setValidator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    const fetchValidatorDetails = async () => {
      try {
        setLoading(true);
        const decodedOwner = decodeURIComponent(owner);
        const response = await api.fetchValidatorInfo(decodedOwner);
        
        // FIXED: Check both possible response structures
        let validatorData = null;
        
        if (response.data.ValidatorInfo) {
          // If wrapped in ValidatorInfo object
          validatorData = response.data.ValidatorInfo;
        } else if (response.data.validatorInfo) {
          // If wrapped in validatorInfo object  
          validatorData = response.data.validatorInfo;
        } else if (response.data) {
          // If direct object
          validatorData = response.data;
        }
        
        setValidator(validatorData);
      } catch (error) {
        console.error('Error fetching validator details:', error);
        setValidator(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchValidatorDetails();
  }, [owner]);

  const testApiConnection = async () => {
    if (!validator?.apiUrl?.trim()) return;

    setTestingApi(true);
    setApiStatus(null);

    try {
      const response = await fetch(validator.apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          success: true,
          message: 'API connection successful',
          timestamp: new Date().toLocaleString(),
          data: data
        });
      } else {
        setApiStatus({
          success: false,
          message: `API returned ${response.status}: ${response.statusText}`,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (err) {
      setApiStatus({
        success: false,
        message: `Connection failed: ${err.message}`,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setTestingApi(false);
    }
  };

  const getValidatorStatus = (validator) => {
    const hasApiUrl = validator?.apiUrl && validator.apiUrl.trim() !== '';
    const hasEarnings = (parseInt(validator?.currentEarnings) || 0) > 0;
    
    if (hasApiUrl && hasEarnings) {
      return { status: 'Active & Tracked', color: '#34a853', icon: IconCheck };
    } else if (hasEarnings) {
      return { status: 'Manual Tracking', color: '#fbbc04', icon: IconSettings };
    } else if (hasApiUrl) {
      return { status: 'API Setup', color: '#4285f4', icon: IconServer };
    } else {
      return { status: 'Setup Required', color: '#ea4335', icon: IconAlertCircle };
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading validator details...</div>;
  }

  if (!validator) {
    return (
      <div className="error-state">
        Validator not found
        <div style={{ marginTop: '16px' }}>
          <Link to="/validator/list" className="button">
            Back to Validator List
          </Link>
        </div>
      </div>
    );
  }

  const status = getValidatorStatus(validator);
  const StatusIcon = status.icon;
  const earnings = parseInt(validator.currentEarnings) || 0;
  const expenditure = parseInt(validator.currentExpenditure) || 0;
  const profit = earnings - expenditure;

  // Chart data
  const earningsBreakdown = [
    { name: 'Earnings', value: earnings, color: '#34a853' },
    { name: 'Expenditure', value: expenditure, color: '#ea4335' }
  ];

  const performanceData = [
    {
      name: 'Financial Overview',
      earnings: earnings,
      expenditure: expenditure,
      profit: profit
    }
  ];

  return (
    <div className="validator-details">
      <div className="page-header">
        <Link to="/validator/list" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Validators</span>
        </Link>
        <div className="button-group">
          <Link to="/validator/record-earnings" className="button">
            <IconTrendingUp size={16} />
            <span>Record Earnings</span>
          </Link>
          <Link to="/validator/record-expenditure" className="button">
            <IconTrendingDown size={16} />
            <span>Record Expenditure</span>
          </Link>
        </div>
      </div>
      
      {/* Validator Header */}
      <div className="card">
        <div className="detail-header" style={{ marginBottom: '24px' }}>
          <StatusIcon size={24} style={{ color: status.color }} />
          <div>
            <h1 style={{ margin: '0', marginBottom: '8px' }}>Validator Details</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge`} style={{ 
                backgroundColor: `${status.color}20`, 
                color: status.color,
                border: `1px solid ${status.color}40`
              }}>
                {status.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Validator Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Owner Address</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {validator.owner}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Validator Address</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {validator.validatorAddress}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Delegation Information</div>
              <div className="detail-value">{validator.delegationStr || 'No delegation information provided'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>
              <IconTrendingUp size={20} />
              <span>Current Earnings</span>
            </h2>
          </div>
          <div className="balance-display" style={{ color: '#34a853' }}>
            {formatAmount(earnings)} stake
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconTrendingDown size={20} />
              <span>Total Expenditure</span>
            </h2>
          </div>
          <div className="balance-display" style={{ color: '#ea4335' }}>
            {formatAmount(expenditure)} stake
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconCoin size={20} />
              <span>Net Profit/Loss</span>
            </h2>
          </div>
          <div className="balance-display" style={{ 
            color: profit >= 0 ? '#34a853' : '#ea4335' 
          }}>
            {profit >= 0 ? '+' : ''}{formatAmount(profit)} stake
          </div>
        </div>
      </div>

      {/* Charts */}
      {(earnings > 0 || expenditure > 0) && (
        <div className="dashboard-grid">
          {/* Earnings vs Expenditure Pie Chart */}
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCoin size={20} />
                <span>Financial Breakdown</span>
              </h2>
            </div>
            {earningsBreakdown.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={earningsBreakdown.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatAmount(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {earningsBreakdown.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value) + ' stake'} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No financial data available</div>
            )}
          </div>
          
          {/* Performance Bar Chart */}
          <div className="card">
            <div className="card-header">
              <h2>
                <IconShield size={20} />
                <span>Performance Overview</span>
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatAmount(value) + ' stake'} />
                <Legend />
                <Bar dataKey="earnings" fill="#34a853" name="Earnings" />
                <Bar dataKey="expenditure" fill="#ea4335" name="Expenditure" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* API Configuration */}
      {validator.apiUrl && validator.apiUrl.trim() !== '' && (
        <div className="card">
          <div className="card-header">
            <h2>
              <IconServer size={20} />
              <span>API Configuration</span>
            </h2>
            <button
              onClick={testApiConnection}
              disabled={testingApi}
              className="button button-secondary"
            >
              {testingApi ? (
                <>
                  <IconRefresh size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Testing...
                </>
              ) : (
                <>
                  <IconRefresh size={16} />
                  Test API
                </>
              )}
            </button>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">API URL</div>
              <div className="detail-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    flex: 1,
                    wordBreak: 'break-all'
                  }}>
                    {validator.apiUrl}
                  </code>
                  <a
                    href={validator.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-icon"
                    title="Open API URL in new tab"
                  >
                    <IconExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">API Status</div>
              <div className="detail-value">
                {apiStatus ? (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: apiStatus.success ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
                    border: `1px solid ${apiStatus.success ? '#34a853' : '#ea4335'}`,
                    fontSize: '14px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: apiStatus.success ? '#137333' : '#c5221f'
                    }}>
                      {apiStatus.success ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconAlertCircle size={16} />
                      )}
                      <span style={{ fontWeight: '500' }}>
                        {apiStatus.message}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginTop: '4px',
                      color: apiStatus.success ? '#137333' : '#c5221f',
                      opacity: 0.8
                    }}>
                      Last tested: {apiStatus.timestamp}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    Click "Test API" to check connection
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {(earnings > 0 || expenditure > 0) && (
        <div className="card">
          <div className="card-header">
            <h2>Performance Metrics</h2>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ROI (Return on Investment)</div>
              <div className="detail-value" style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: expenditure > 0 ? (profit > 0 ? '#34a853' : '#ea4335') : '#6c757d'
              }}>
                {expenditure > 0 ? `${((profit / expenditure) * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Profit Margin</div>
              <div className="detail-value" style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: earnings > 0 ? (profit > 0 ? '#34a853' : '#ea4335') : '#6c757d'
              }}>
                {earnings > 0 ? `${((profit / earnings) * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Cost Ratio</div>
              <div className="detail-value" style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: earnings > 0 ? '#4285f4' : '#6c757d'
              }}>
                {earnings > 0 ? `${((expenditure / earnings) * 100).toFixed(2)}%` : 'N/A'}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Break-even Status</div>
              <div className="detail-value">
                {profit > 0 ? (
                  <span style={{ color: '#34a853', fontWeight: '600' }}>✓ Profitable</span>
                ) : profit < 0 ? (
                  <span style={{ color: '#ea4335', fontWeight: '600' }}>⚠ Loss</span>
                ) : (
                  <span style={{ color: '#fbbc04', fontWeight: '600' }}>⚖ Break-even</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="button-group" style={{flexDirection: 'column', gap: '12px'}}>
          <Link to="/validator/record-earnings" className="button">
            <IconTrendingUp size={16} />
            <span>Record New Earnings</span>
          </Link>
          <Link to="/validator/record-expenditure" className="button">
            <IconTrendingDown size={16} />
            <span>Record New Expenditure</span>
          </Link>
          <Link to="/validator/setup" className="button button-secondary">
            <IconSettings size={16} />
            <span>Update Configuration</span>
          </Link>
        </div>
      </div>

      {/* Performance Tips */}
      {(earnings === 0 && expenditure === 0) && (
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(251, 188, 4, 0.1)',
          border: '1px solid rgba(251, 188, 4, 0.3)',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <IconAlertCircle size={24} style={{ color: '#856404', marginTop: '2px' }} />
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                Get Started with Tracking
              </h3>
              <p style={{ margin: '0', color: '#856404', lineHeight: '1.5' }}>
                This validator doesn't have any earnings or expenditure records yet. Start by recording your 
                validator earnings and operating costs to track performance and profitability.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <Link to="/validator/record-earnings" className="button" style={{ fontSize: '14px' }}>
                  Record First Earnings
                </Link>
                <Link to="/validator/record-expenditure" className="button button-secondary" style={{ fontSize: '14px' }}>
                  Record Expenditure
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidatorDetails;