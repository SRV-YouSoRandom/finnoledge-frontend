import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { IconFolder, IconList, IconNotes } from '@tabler/icons-react';

function Dashboard({ user }) {
  const [balance, setBalance] = useState(null);
  const [groups, setGroups] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get wallet address from user for balance check
        // For demo, we use hardcoded "bob" since that's what the sample uses
        const address = "erpbobtq4tgz5ygtn4ljw3vhepnmjl9y90hjr2ng4"; // Replace with actual address format
        
        const [balanceRes, groupsRes, ledgersRes, entriesRes] = await Promise.all([
          api.fetchBalance(address),
          api.fetchGroups(),
          api.fetchLedgers(),
          api.fetchJournalEntries()
        ]);
        
        setBalance(balanceRes.data);
        setGroups(groupsRes.data.Group || []);
        setLedgers(ledgersRes.data.ErpLedger || []);
        setJournalEntries(entriesRes.data.JournalEntry || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  // Format balance for display
  const formatBalance = () => {
    if (!balance || !balance.balances || balance.balances.length === 0) {
      return "0 stake";
    }
    return `${balance.balances[0].amount} ${balance.balances[0].denom}`;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-summary">
        <div className="card">
          <h2>Wallet Balance</h2>
          <div className="balance-display">{formatBalance()}</div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>
              <IconFolder size={20} />
              <span>Account Groups</span>
            </h2>
            <Link to="/groups" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {groups.slice(0, 5).map(group => (
              <Link to={`/groups/${group.id}`} key={group.id} className="list-item">
                <div className="list-item-title">{group.name}</div>
                <div className="list-item-subtitle">
                  <span className={`badge badge-${group.groupType.toLowerCase()}`}>
                    {group.groupType}
                  </span>
                </div>
              </Link>
            ))}
            {groups.length === 0 && <div className="empty-state">No groups found</div>}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconList size={20} />
              <span>Ledger Accounts</span>
            </h2>
            <Link to="/ledgers" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {ledgers.slice(0, 5).map(ledger => (
              <Link to={`/ledgers/${ledger.id}`} key={ledger.id} className="list-item">
                <div className="list-item-title">{ledger.name}</div>
                <div className="list-item-subtitle">
                  Group: {ledger.groupName}
                </div>
              </Link>
            ))}
            {ledgers.length === 0 && <div className="empty-state">No ledgers found</div>}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconNotes size={20} />
              <span>Recent Journal Entries</span>
            </h2>
            <Link to="/journal-entries" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {journalEntries.slice(0, 5).map(entry => (
              <Link to={`/journal-entries/${entry.id}`} key={entry.id} className="list-item">
                <div className="list-item-title">{entry.description}</div>
                <div className="list-item-subtitle">
                  ID: {entry.id}
                </div>
              </Link>
            ))}
            {journalEntries.length === 0 && <div className="empty-state">No journal entries found</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;