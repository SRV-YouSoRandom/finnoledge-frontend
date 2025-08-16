// client/src/pages/Validator/ValidatorOverview.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  IconShield, 
  IconPlus, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconCoin,
  IconSettings,
  IconAlertCircle,
  IconCheck,
  IconServer
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ValidatorOverview() {
  const [validatorInfos, setValidatorInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalEarnings: 0,
    totalExpenditure: 0,
    netProfit: 0,
    totalValidators: 0,
    earningsVsExpenditure: [],
    validatorDistribution: []
  });

  useEffect(() => {
    const fetchValidatorData = async () => {
      try {
        setLoading(true);
        
        // Fetch all validator tracking information
        const response = await api.fetchValidatorInfos();
        const validatorData = response.data.ValidatorInfo || [];
        setValidatorInfos(validatorData);
        
        // Process analytics
        processAnalytics(validatorData);
        
      } catch (error) {
        console.error('Error fetching validator data:', error);
        // Set empty data on error
        setValidatorInfos([]);
        processAnalytics([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchValidatorData();
  }, []);

  const processAnalytics = (validatorData) => {
    if (!validatorData || validatorData.length === 0) {
      setAnalytics({
        totalEarnings: 0,
        totalExpenditure: 0,
        netProfit: 0,
        totalValidators: 0,
        earningsVsExpenditure: [],
        validatorDistribution: []
      });
      return;
    }

    const totalEarnings = validatorData.reduce((sum, validator) => 
      sum + (parseInt(validator.currentEarnings) || 0), 0
    );
    
    const totalExpenditure = validatorData.reduce((sum, validator) => 
      sum + (parseInt(validator.currentExpenditure) || 0), 0
    );
    
    const netProfit = totalEarnings - totalExpenditure;
    
    // Earnings vs Expenditure chart data
    const earningsVsExpenditure = [
      { name: 'Total Earnings', value: totalEarnings, color: '#34a853' },
      { name: 'Total Expenditure', value: totalExpenditure, color: '#ea4335' }
    ];
    
    // Validator distribution by earnings
    const validatorDistribution = validatorData.map((validator, index) => ({
      name: `Validator ${index + 1}`,
      earnings: parseInt(validator.currentEarnings) || 0,
      expenditure: parseInt(validator.currentExpenditure) || 0,
      profit: (parseInt(validator.currentEarnings) || 0) - (parseInt(validator.currentExpenditure) || 0)
    }));

    setAnalytics({
      totalEarnings,
      totalExpenditure,
      netProfit,
      totalValidators: validatorData.length,
      earningsVsExpenditure,
      validatorDistribution
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getValidatorStatus = (validator) => {
    const hasApiUrl = validator.apiUrl && validator.apiUrl.trim() !== '';
    const hasEarnings = (parseInt(validator.currentEarnings) || 0) > 0;
    
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

  if (loading) {
    return <div className="loading">Loading validator overview...</div>;
  }

  return (
    <div className="validator-overview">
      <div className="page-header">
        <h1>Validator Overview</h1>
        <div className="button-group">
          <Link to="/validator/setup" className="button">
            <IconPlus size={16} />
            <span>Setup Validator Tracking</span>
          </Link>
          <Link to="/validator/record-earnings" className="button button-secondary">
            <IconTrendingUp size={16} />
            <span>Record Earnings</span>
          </Link>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-summary">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>
                <IconShield size={20} />
                <span>Tracked Validators</span>
              </h2>
            </div>
            <div className="balance-display">
              {analytics.totalValidators}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconTrendingUp size={20} />
                <span>Total Earnings</span>
              </h2>
            </div>
            <div className="balance-display" style={{ color: '#34a853' }}>
              {formatAmount(analytics.totalEarnings)} stake
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
              {formatAmount(analytics.totalExpenditure)} stake
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCoin size={20} />
                <span>Net Profit</span>
              </h2>
            </div>
            <div className="balance-display" style={{ 
              color: analytics.netProfit >= 0 ? '#34a853' : '#ea4335' 
            }}>
              {analytics.netProfit >= 0 ? '+' : ''}{formatAmount(analytics.netProfit)} stake
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Analytics */}
      {validatorInfos.length > 0 && (
        <div className="dashboard-grid">
          {/* Earnings vs Expenditure Pie Chart */}
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCoin size={20} />
                <span>Earnings vs Expenditure</span>
              </h2>
            </div>
            {analytics.earningsVsExpenditure.length > 0 && 
             analytics.earningsVsExpenditure.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.earningsVsExpenditure}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatAmount(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.earningsVsExpenditure.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(value) + ' stake'} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No earnings or expenditure data available</div>
            )}
          </div>
          
          {/* Validator Performance Bar Chart */}
          <div className="card">
            <div className="card-header">
              <h2>
                <IconShield size={20} />
                <span>Validator Performance</span>
              </h2>
            </div>
            {analytics.validatorDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.validatorDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(value) + ' stake'} />
                  <Legend />
                  <Bar dataKey="earnings" fill="#34a853" name="Earnings" />
                  <Bar dataKey="expenditure" fill="#ea4335" name="Expenditure" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No validator performance data available</div>
            )}
          </div>
        </div>
      )}
      
      {/* Validator List */}
      <div className="card">
        <div className="card-header">
          <h2>
            <IconShield size={20} />
            <span>Tracked Validators</span>
          </h2>
          <Link to="/validator/list" className="button button-secondary">View All</Link>
        </div>
        
        {validatorInfos.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Validator Address</th>
                <th>Status</th>
                <th>Earnings</th>
                <th>Expenditure</th>
                <th>Profit/Loss</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {validatorInfos.slice(0, 5).map((validator, index) => {
                const status = getValidatorStatus(validator);
                const StatusIcon = status.icon;
                const earnings = parseInt(validator.currentEarnings) || 0;
                const expenditure = parseInt(validator.currentExpenditure) || 0;
                const profit = earnings - expenditure;
                
                return (
                  <tr key={validator.owner || index}>
                    <td>
                      <code style={{ 
                        backgroundColor: 'rgba(0,0,0,0.05)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {validator.owner?.substring(0, 20)}...
                      </code>
                    </td>
                    <td>
                      <code style={{ 
                        backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {validator.validatorAddress?.substring(0, 20)}...
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusIcon size={16} style={{ color: status.color }} />
                        <span style={{ color: status.color, fontWeight: '500' }}>
                          {status.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      fontWeight: '600', 
                      color: earnings > 0 ? '#34a853' : '#6c757d'
                    }}>
                      {formatAmount(earnings)} stake
                    </td>
                    <td style={{ 
                      fontWeight: '600', 
                      color: expenditure > 0 ? '#ea4335' : '#6c757d'
                    }}>
                      {formatAmount(expenditure)} stake
                    </td>
                    <td style={{ 
                      fontWeight: '600', 
                      color: profit >= 0 ? '#34a853' : '#ea4335'
                    }}>
                      {profit >= 0 ? '+' : ''}{formatAmount(profit)} stake
                    </td>
                    <td>
                      <Link 
                        to={`/validator/details/${encodeURIComponent(validator.owner)}`} 
                        className="button button-secondary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <IconShield size={48} style={{ color: 'var(--secondary-color)', marginBottom: '16px' }} />
            <h3>No Validators Tracked Yet</h3>
            <p>Start tracking your validator performance by setting up your first validator.</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/validator/setup" className="button">
                <IconPlus size={16} />
                Setup Validator Tracking
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      {validatorInfos.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="button-group" style={{flexDirection: 'column', gap: '12px'}}>
            <Link to="/validator/record-earnings" className="button">
              <IconTrendingUp size={16} />
              <span>Record Manual Earnings</span>
            </Link>
            <Link to="/validator/record-expenditure" className="button">
              <IconTrendingDown size={16} />
              <span>Record Expenditure</span>
            </Link>
            <Link to="/validator/setup" className="button button-secondary">
              <IconSettings size={16} />
              <span>Setup New Validator</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidatorOverview;