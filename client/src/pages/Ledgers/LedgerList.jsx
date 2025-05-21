import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPlus, IconList } from '@tabler/icons-react';

function LedgerList() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        setLoading(true);
        const response = await api.fetchLedgers();
        setLedgers(response.data.ErpLedger || []);
      } catch (error) {
        console.error('Error fetching ledgers:', error);
        setError('Failed to load ledger accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLedgers();
  }, []);

  if (loading) {
    return <div className="loading">Loading ledger accounts...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="ledger-list">
      <div className="page-header">
        <h1>Ledger Accounts</h1>
        <Link to="/create-ledger" className="button">
          <IconPlus size={16} />
          <span>Create Ledger</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Group</th>
              <th>Opening Balance</th>
              <th>Balance Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map(ledger => (
              <tr key={ledger.id}>
                <td>{ledger.id}</td>
                <td>{ledger.name}</td>
                <td>{ledger.groupName}</td>
                <td>{ledger.openingBalance || '0'}</td>
                <td>{ledger.openingBalanceType || 'N/A'}</td>
                <td>
                  <Link to={`/ledgers/${ledger.id}`} className="button button-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {ledgers.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No ledger accounts found. Create your first ledger account using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LedgerList;