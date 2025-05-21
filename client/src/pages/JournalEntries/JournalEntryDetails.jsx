import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconNotes } from '@tabler/icons-react';

function JournalEntryDetails() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournalEntryDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchJournalEntry(id);
        setEntry(response.data.JournalEntry);
      } catch (error) {
        console.error('Error fetching journal entry details:', error);
        setError('Failed to load journal entry details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJournalEntryDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading journal entry details...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!entry) {
    return <div className="not-found">Journal entry not found</div>;
  }

  // Calculate totals
  const calculateTotals = () => {
    if (!entry.transactions || !Array.isArray(entry.transactions)) {
      return { totalDebits: 0, totalCredits: 0 };
    }
    
    const totalDebits = entry.transactions
      .filter(tx => tx.entryType === 'Debit')
      .reduce((sum, tx) => sum + parseInt(tx.amount || 0), 0);
      
    const totalCredits = entry.transactions
      .filter(tx => tx.entryType === 'Credit')
      .reduce((sum, tx) => sum + parseInt(tx.amount || 0), 0);
      
    return { totalDebits, totalCredits };
  };

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = totalDebits === totalCredits;

  return (
    <div className="journal-entry-details">
      <div className="page-header">
        <Link to="/journal-entries" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Journal Entries</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconNotes size={24} />
          <h1>Journal Entry #{entry.id}</h1>
          <span className={`badge ${isBalanced ? 'badge-success' : 'badge-error'}`}>
            {isBalanced ? 'Balanced' : 'Unbalanced'}
          </span>
        </div>
        
        <div className="detail-section">
          <h2>Entry Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">{entry.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{entry.description}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{entry.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Transactions</h2>
          
          {entry.transactions && entry.transactions.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ledger Account</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.transactions.map((tx, index) => (
                    <tr key={index}>
                      <td>{tx.ledgerName}</td>
                      <td>
                        <span className={`badge ${tx.entryType === 'Debit' ? 'badge-info' : 'badge-warning'}`}>
                          {tx.entryType}
                        </span>
                      </td>
                      <td>{tx.amount} stake</td>
                    </tr>
                  ))}
                  
                  {/* Totals row */}
                  <tr className="totals-row">
                    <td>Totals</td>
                    <td></td>
                    <td>
                      <div>Debits: {totalDebits} stake</div>
                      <div>Credits: {totalCredits} stake</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {!isBalanced && (
                <div className="warning-message">
                  This journal entry is not balanced. Debits ({totalDebits}) do not equal Credits ({totalCredits}).
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              No transactions found for this journal entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JournalEntryDetails;