// client/src/pages/Validator/ValidatorList.jsx - SIMPLE FIX
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  IconPlus, 
  IconShield, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconServer,
  IconSettings,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';

function ValidatorList() {
  const [validators, setValidators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('earnings'); // 'earnings', 'expenditure', 'profit'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        setLoading(true);
        const response = await api.fetchValidatorInfos();
        
        // FIXED: Use lowercase 'validatorInfo' instead of 'ValidatorInfo'
        setValidators(response.data.validatorInfo || []);
      } catch (error) {
        console.error('Error fetching validators:', error);
        setValidators([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchValidators();
  }, []);

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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortValidators = (validators) => {
    return [...validators].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'earnings':
          aValue = parseInt(a.currentEarnings) || 0;
          bValue = parseInt(b.currentEarnings) || 0;
          break;
        case 'expenditure':
          aValue = parseInt(a.currentExpenditure) || 0;
          bValue = parseInt(b.currentExpenditure) || 0;
          break;
        case 'profit':
          aValue = (parseInt(a.currentEarnings) || 0) - (parseInt(a.currentExpenditure) || 0);
          bValue = (parseInt(b.currentEarnings) || 0) - (parseInt(b.currentExpenditure) || 0);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  const sortedValidators = sortValidators(validators);

  // Calculate totals
  const totals = validators.reduce((acc, validator) => {
    const earnings = parseInt(validator.currentEarnings) || 0;
    const expenditure = parseInt(validator.currentExpenditure) || 0;
    return {
      totalEarnings: acc.totalEarnings + earnings,
      totalExpenditure: acc.totalExpenditure + expenditure,
      totalProfit: acc.totalProfit + (earnings - expenditure)
    };
  }, { totalEarnings: 0, totalExpenditure: 0, totalProfit: 0 });

  if (loading) {
    return <div className="loading">Loading validators...</div>;
  }

  return (
    <div className="validator-list">
      <div className="page-header">
        <h1>All Validators</h1>
        <Link to="/validator/setup" className="button">
          <IconPlus size={16} />
          <span>Setup New Validator</span>
        </Link>
      </div>

      {/* Summary Stats */}
      {validators.length > 0 && (
        <div className="dashboard-summary">
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h2>
                  <IconTrendingUp size={20} />
                  <span>Total Earnings</span>
                </h2>
              </div>
              <div className="balance-display" style={{ color: '#34a853' }}>
                {formatAmount(totals.totalEarnings)} stake
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
                {formatAmount(totals.totalExpenditure)} stake
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2>
                  <IconShield size={20} />
                  <span>Net Profit</span>
                </h2>
              </div>
              <div className="balance-display" style={{ 
                color: totals.totalProfit >= 0 ? '#34a853' : '#ea4335' 
              }}>
                {totals.totalProfit >= 0 ? '+' : ''}{formatAmount(totals.totalProfit)} stake
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card">
        {validators.length > 0 ? (
          <>
            {/* Sort Controls */}
            <div style={{ 
              marginBottom: '16px', 
              padding: '16px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '500', color: 'var(--secondary-color)' }}>
                  Sort by:
                </span>
                <button
                  onClick={() => handleSort('earnings')}
                  className={`button ${sortBy === 'earnings' ? '' : 'button-secondary'}`}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  Earnings {getSortIcon('earnings')}
                </button>
                <button
                  onClick={() => handleSort('expenditure')}
                  className={`button ${sortBy === 'expenditure' ? '' : 'button-secondary'}`}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  Expenditure {getSortIcon('expenditure')}
                </button>
                <button
                  onClick={() => handleSort('profit')}
                  className={`button ${sortBy === 'profit' ? '' : 'button-secondary'}`}
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  Profit/Loss {getSortIcon('profit')}
                </button>
              </div>
            </div>

            {/* Validators Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Owner Address</th>
                  <th>Validator Address</th>
                  <th>Status</th>
                  <th>API URL</th>
                  <th>Earnings</th>
                  <th>Expenditure</th>
                  <th>Profit/Loss</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedValidators.map((validator, index) => {
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
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}>
                          {validator.owner?.substring(0, 12)}...
                        </code>
                      </td>
                      <td>
                        <code style={{ 
                          backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}>
                          {validator.validatorAddress?.substring(0, 16)}...
                        </code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StatusIcon size={16} style={{ color: status.color }} />
                          <span style={{ 
                            color: status.color, 
                            fontWeight: '500',
                            fontSize: '13px'
                          }}>
                            {status.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        {validator.apiUrl && validator.apiUrl.trim() !== '' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <IconServer size={14} style={{ color: '#4285f4' }} />
                            <span style={{ fontSize: '12px', color: '#4285f4' }}>
                              Configured
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#6c757d' }}>
                            Manual
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        fontWeight: '600', 
                        color: earnings > 0 ? '#34a853' : '#6c757d',
                        textAlign: 'right'
                      }}>
                        {formatAmount(earnings)}
                      </td>
                      <td style={{ 
                        fontWeight: '600', 
                        color: expenditure > 0 ? '#ea4335' : '#6c757d',
                        textAlign: 'right'
                      }}>
                        {formatAmount(expenditure)}
                      </td>
                      <td style={{ 
                        fontWeight: '600', 
                        color: profit >= 0 ? '#34a853' : '#ea4335',
                        textAlign: 'right'
                      }}>
                        {profit >= 0 ? '+' : ''}{formatAmount(profit)}
                      </td>
                      <td>
                        <Link 
                          to={`/validator/details/${encodeURIComponent(validator.owner)}`} 
                          className="button button-secondary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Totals Footer */}
              <tfoot>
                <tr style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.05)',
                  fontWeight: '600'
                }}>
                  <td colSpan="4"><strong>Totals</strong></td>
                  <td style={{ 
                    textAlign: 'right',
                    color: '#34a853'
                  }}>
                    <strong>{formatAmount(totals.totalEarnings)}</strong>
                  </td>
                  <td style={{ 
                    textAlign: 'right',
                    color: '#ea4335'
                  }}>
                    <strong>{formatAmount(totals.totalExpenditure)}</strong>
                  </td>
                  <td style={{ 
                    textAlign: 'right',
                    color: totals.totalProfit >= 0 ? '#34a853' : '#ea4335'
                  }}>
                    <strong>
                      {totals.totalProfit >= 0 ? '+' : ''}{formatAmount(totals.totalProfit)}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <div className="empty-state">
            <IconShield size={48} style={{ color: 'var(--secondary-color)', marginBottom: '16px' }} />
            <h3>No Validators Found</h3>
            <p>You haven't set up any validator tracking yet. Get started by setting up your first validator.</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/validator/setup" className="button">
                <IconPlus size={16} />
                Setup Validator Tracking
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidatorList;