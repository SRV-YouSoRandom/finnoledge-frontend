import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconList } from '@tabler/icons-react';

function LedgerDetails() {
  const { id } = useParams();
  const [ledger, setLedger] = useState(null);
  const [relatedEntries, setRelatedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLedgerDetails = async () => {
      try {
        setLoading(true);
        // Fetch ledger details
        const ledgerResponse = await api.fetchLedger(id);
        setLedger(ledgerResponse.data.ErpLedger);
        
        // Fetch all journal entries to find related ones
        const entriesResponse = await api.fetchJournalEntries();
        const entries = entriesResponse.data.JournalEntry || [];
        
        // Filter entries that include this ledger
        const relatedEntriesList = entries.filter(entry => {
          if (!entry.transactions || entry.transactions.length === 0) {
            return false;
          }
          // Check if any transaction in this entry references this ledger
          return entry.transactions.some(tx => 
            tx.ledgerName === ledgerResponse.data.ErpLedger.name
          );
        });
        
        setRelatedEntries(relatedEntriesList);
      } catch (error) {
        console.error('Error fetching ledger details:', error);
        setError('Failed to load ledger details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLedgerDetails();
  }, [id]);

  // Calculate totals and closing balance
  const calculateBalances = () => {
    if (!ledger || !relatedEntries.length) {
      const openingBalance = parseFloat(ledger?.openingBalance || 0);
      return {
        totalDebits: 0,
        totalCredits: 0,
        closingBalance: openingBalance,
        openingBalance: openingBalance
      };
    }

    let totalDebits = 0;
    let totalCredits = 0;

    // Calculate debits and credits from journal entries
    relatedEntries.forEach(entry => {
      entry.transactions.forEach(transaction => {
        if (transaction.ledgerName === ledger.name) {
          const amount = parseFloat(transaction.amount || 0);
          if (transaction.entryType === 'Debit') {
            totalDebits += amount;
          } else if (transaction.entryType === 'Credit') {
            totalCredits += amount;
          }
        }
      });
    });

    const openingBalance = parseFloat(ledger.openingBalance || 0);
    const openingBalanceType = ledger.openingBalanceType || 'Debit';

    // Calculate closing balance based on accounting principles
    let closingBalance;
    
    if (openingBalanceType === 'Debit') {
      // For debit balance accounts: Closing = Opening + Debits - Credits
      closingBalance = openingBalance + totalDebits - totalCredits;
    } else {
      // For credit balance accounts: Closing = Opening + Credits - Debits
      closingBalance = openingBalance + totalCredits - totalDebits;
    }

    return {
      totalDebits,
      totalCredits,
      closingBalance,
      openingBalance
    };
  };

  if (loading) {
    return <div className="loading">Loading ledger details...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!ledger) {
    return <div className="not-found">Ledger not found</div>;
  }

  const balances = calculateBalances();

  return (
    <div className="ledger-details">
      <div className="page-header">
        <Link to="/ledgers" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Ledgers</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconList size={24} />
          <h1>{ledger.name}</h1>
          <span className="badge">{ledger.groupName}</span>
        </div>
        
        <div className="detail-section">
          <h2>Ledger Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">{ledger.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{ledger.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Group</div>
              <div className="detail-value">{ledger.groupName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Opening Balance</div>
              <div className="detail-value">{ledger.openingBalance || '0'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Opening Balance Type</div>
              <div className="detail-value">{ledger.openingBalanceType || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Creator</div>
              <div className="detail-value">{ledger.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Journal Entries</h2>
          
          {relatedEntries.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Entry Type</th>
                    <th>Debit Amount</th>
                    <th>Credit Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedEntries.map(entry => {
                    // Find the transaction in this entry that references this ledger
                    const transaction = entry.transactions.find(tx => 
                      tx.ledgerName === ledger.name
                    );
                    
                    const amount = parseFloat(transaction?.amount || 0);
                    const isDebit = transaction?.entryType === 'Debit';
                    
                    return (
                      <tr key={entry.id}>
                        <td>{entry.id}</td>
                        <td>{entry.description}</td>
                        <td>{transaction ? transaction.entryType : 'N/A'}</td>
                        <td>{isDebit ? amount.toFixed(2) : '-'}</td>
                        <td>{!isDebit && transaction ? amount.toFixed(2) : '-'}</td>
                        <td>
                          <Link to={`/journal-entries/${entry.id}`} className="button button-secondary">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="summary-row">
                    <td colSpan="3"><strong>Totals:</strong></td>
                    <td><strong>{balances.totalDebits.toFixed(2)}</strong></td>
                    <td><strong>{balances.totalCredits.toFixed(2)}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="balance-summary">
                <div className="balance-item">
                  <span className="balance-label">Opening Balance ({ledger.openingBalanceType || 'Debit'}):</span>
                  <span className="balance-value">{balances.openingBalance.toFixed(2)}</span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Total Debits:</span>
                  <span className="balance-value">{balances.totalDebits.toFixed(2)}</span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">Total Credits:</span>
                  <span className="balance-value">{balances.totalCredits.toFixed(2)}</span>
                </div>
                <div className="balance-item closing-balance">
                  <span className="balance-label">Closing Balance:</span>
                  <span className="balance-value">
                    {balances.closingBalance.toFixed(2)} 
                    {balances.closingBalance >= 0 ? 
                      ` (${ledger.openingBalanceType || 'Debit'})` : 
                      ` (${ledger.openingBalanceType === 'Debit' ? 'Credit' : 'Debit'})`
                    }
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="empty-state">
                No journal entries found for this ledger.
                <div>
                  <Link to="/create-journal-entry" className="button">
                    Create Journal Entry
                  </Link>
                </div>
              </div>
              
              <div className="balance-summary">
                <div className="balance-item closing-balance">
                  <span className="balance-label">Current Balance:</span>
                  <span className="balance-value">
                    {balances.openingBalance.toFixed(2)} ({ledger.openingBalanceType || 'Debit'})
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LedgerDetails;