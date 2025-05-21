import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconFolder } from '@tabler/icons-react';

function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [relatedLedgers, setRelatedLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        // Fetch group details
        const groupResponse = await api.fetchGroup(id);
        setGroup(groupResponse.data.Group);
        
        // Fetch all ledgers to find related ones
        const ledgersResponse = await api.fetchLedgers();
        const ledgers = ledgersResponse.data.ErpLedger || [];
        
        // Filter ledgers that belong to this group
        const related = ledgers.filter(ledger => 
          ledger.groupName === groupResponse.data.Group.name
        );
        setRelatedLedgers(related);
      } catch (error) {
        console.error('Error fetching group details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return <div className="error-state">Group not found</div>;
  }

  const groupTypeClasses = {
    'Asset': 'badge-asset',
    'Liability': 'badge-liability',
    'Equity': 'badge-equity',
    'Revenue': 'badge-revenue',
    'Expense': 'badge-expense'
  };

  return (
    <div className="group-details">
      <div className="page-header">
        <Link to="/groups" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Groups</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconFolder size={24} />
          <h1>{group.name}</h1>
          <span className={`badge ${groupTypeClasses[group.groupType] || ''}`}>
            {group.groupType}
          </span>
        </div>
        
        <div className="detail-section">
          <h2>Group Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">{group.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{group.description}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Group Type</div>
              <div className="detail-value">{group.groupType}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{group.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Related Ledger Accounts</h2>
          
          {relatedLedgers.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Opening Balance</th>
                  <th>Balance Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {relatedLedgers.map(ledger => (
                  <tr key={ledger.id}>
                    <td>{ledger.id}</td>
                    <td>{ledger.name}</td>
                    <td>{ledger.openingBalance}</td>
                    <td>{ledger.openingBalanceType}</td>
                    <td>
                      <Link to={`/ledgers/${ledger.id}`} className="button button-secondary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              No ledger accounts in this group.
              <div>
                <Link to="/create-ledger" className="button">
                  Create Ledger Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;