import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { IconFolder, IconList, IconNotes, IconTrendingUp, IconCoin, IconChartPie } from '@tabler/icons-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

function Dashboard({ user }) {
  const [balance, setBalance] = useState(null);
  const [groups, setGroups] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    groupsByType: [],
    ledgersByGroup: [],
    recentActivity: [],
    totalsByType: {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get wallet address from user for balance check
        const address = "erp1kn33pdt89c3frmg64wdvg4hqwqppgw2jnf3x95";
        
        const [balanceRes, groupsRes, ledgersRes, entriesRes] = await Promise.all([
          api.fetchBalance(address),
          api.fetchGroups(),
          api.fetchLedgers(),
          api.fetchJournalEntries()
        ]);
        
        const fetchedBalance = balanceRes.data;
        const fetchedGroups = groupsRes.data.Group || [];
        const fetchedLedgers = ledgersRes.data.ErpLedger || [];
        const fetchedEntries = entriesRes.data.JournalEntry || [];
        
        setBalance(fetchedBalance);
        setGroups(fetchedGroups);
        setLedgers(fetchedLedgers);
        setJournalEntries(fetchedEntries);
        
        // Process analytics data
        processAnalytics(fetchedGroups, fetchedLedgers, fetchedEntries);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const processAnalytics = (groups, ledgers, entries) => {
    // Group distribution by type
    const groupTypeCount = groups.reduce((acc, group) => {
      acc[group.groupType] = (acc[group.groupType] || 0) + 1;
      return acc;
    }, {});
    
    const groupsByType = Object.entries(groupTypeCount).map(([type, count]) => ({
      name: type,
      value: count,
      color: getColorForType(type)
    }));

    // Ledgers by group analysis
    const ledgersByGroup = groups.map(group => {
      const groupLedgers = ledgers.filter(ledger => ledger.groupName === group.name);
      const totalBalance = groupLedgers.reduce((sum, ledger) => {
        return sum + (parseInt(ledger.openingBalance) || 0);
      }, 0);
      
      return {
        name: group.name.length > 15 ? group.name.substring(0, 15) + '...' : group.name,
        fullName: group.name,
        count: groupLedgers.length,
        balance: totalBalance,
        type: group.groupType
      };
    }).filter(item => item.count > 0);

    // Calculate totals by type
    const totalsByType = groups.reduce((acc, group) => {
      const groupLedgers = ledgers.filter(ledger => ledger.groupName === group.name);
      const groupTotal = groupLedgers.reduce((sum, ledger) => {
        return sum + (parseInt(ledger.openingBalance) || 0);
      }, 0);
      
      const type = group.groupType.toLowerCase();
      if (acc.hasOwnProperty(`${type}s`)) {
        acc[`${type}s`] += groupTotal;
      } else if (type === 'equity') {
        acc.equity += groupTotal;
      }
      
      return acc;
    }, {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenues: 0,
      expenses: 0
    });

    // Recent activity from journal entries
    const recentActivity = entries.slice(-10).reverse().map((entry, index) => ({
      id: entry.id,
      description: entry.description,
      date: new Date().toISOString().split('T')[0], // Mock date since not in API
      index: entries.length - index
    }));

    setAnalytics({
      groupsByType,
      ledgersByGroup,
      recentActivity,
      totalsByType
    });
  };

  const getColorForType = (type) => {
    const colors = {
      'Asset': '#34a853',
      'Liability': '#ea4335',
      'Equity': '#fbbc04',
      'Revenue': '#4285f4',
      'Expense': '#9c27b0'
    };
    return colors[type] || '#6c757d';
  };

  const formatBalance = () => {
    if (!balance || !balance.balances || balance.balances.length === 0) {
      return "0 stake";
    }
    return `${balance.balances[0].amount} ${balance.balances[0].denom}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-summary">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCoin size={20} />
                <span>Wallet Balance</span>
              </h2>
            </div>
            <div className="balance-display">{formatBalance()}</div>
          </div>
          
          {/* <div className="card">
            <div className="card-header">
              <h2>
                <IconTrendingUp size={20} />
                <span>Total Assets</span>
              </h2>
            </div>
            <div className="balance-display">{formatCurrency(analytics.totalsByType.assets)}</div>
          </div> */}
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconFolder size={20} />
                <span>Account Groups</span>
              </h2>
            </div>
            <div className="balance-display">{groups.length}</div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconList size={20} />
                <span>Ledger Accounts</span>
              </h2>
            </div>
            <div className="balance-display">{ledgers.length}</div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="dashboard-grid">
        {/* Group Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconChartPie size={20} />
              <span>Account Groups by Type</span>
            </h2>
          </div>
          {analytics.groupsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.groupsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.groupsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No groups data available</div>
          )}
        </div>
        
        {/* Ledgers by Group Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconList size={20} />
              <span>Ledgers per Group</span>
            </h2>
          </div>
          {analytics.ledgersByGroup.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ledgersByGroup}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'count' ? 'Ledgers' : 'Balance']}
                  labelFormatter={(label) => {
                    const item = analytics.ledgersByGroup.find(g => g.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="count" fill="#1a73e8" name="Ledger Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No ledger data available</div>
          )}
        </div>
        
        {/* Balance Overview */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconTrendingUp size={20} />
              <span>Balance Overview</span>
            </h2>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Total Assets</div>
              <div className="detail-value" style={{color: '#34a853'}}>{formatCurrency(analytics.totalsByType.assets)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Liabilities</div>
              <div className="detail-value" style={{color: '#ea4335'}}>{formatCurrency(analytics.totalsByType.liabilities)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Equity</div>
              <div className="detail-value" style={{color: '#fbbc04'}}>{formatCurrency(analytics.totalsByType.equity)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Net Position</div>
              <div className="detail-value" style={{color: '#4285f4'}}>
                {formatCurrency(analytics.totalsByType.assets - analytics.totalsByType.liabilities)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconNotes size={20} />
              <span>Recent Journal Entries</span>
            </h2>
            <Link to="/journal-entries" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.slice(0, 5).map(entry => (
                <Link to={`/journal-entries/${entry.id}`} key={entry.id} className="list-item">
                  <div className="list-item-title">{entry.description}</div>
                  <div className="list-item-subtitle">
                    Entry ID: {entry.id}
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">No recent entries found</div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="button-group" style={{flexDirection: 'column', gap: '12px'}}>
            <Link to="/create-group" className="button">
              <IconFolder size={16} />
              <span>Create Account Group</span>
            </Link>
            <Link to="/create-ledger" className="button">
              <IconList size={16} />
              <span>Create Ledger Account</span>
            </Link>
            <Link to="/create-journal-entry" className="button">
              <IconNotes size={16} />
              <span>Create Journal Entry</span>
            </Link>
          </div>
        </div>
        
        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h2>System Overview</h2>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Total Groups</div>
              <div className="detail-value">{groups.length}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Ledgers</div>
              <div className="detail-value">{ledgers.length}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Journal Entries</div>
              <div className="detail-value">{journalEntries.length}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Wallet Status</div>
              <div className="detail-value">
                <span className="badge badge-success">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;