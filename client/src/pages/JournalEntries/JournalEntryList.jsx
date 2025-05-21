import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPlus, IconNotes } from '@tabler/icons-react';

function JournalEntryList() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        setLoading(true);
        const response = await api.fetchJournalEntries();
        setEntries(response.data.JournalEntry || []);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        setError('Failed to load journal entries. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJournalEntries();
  }, []);

  // Function to calculate debits and credits for each entry
  const calculateEntryTotals = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return { debits: 0, credits: 0 };
    }
    
    const debits = transactions
      .filter(tx => tx.entryType === 'Debit')
      .reduce((sum, tx) => sum + parseInt(tx.amount || 0), 0);
      
    const credits = transactions
      .filter(tx => tx.entryType === 'Credit')
      .reduce((sum, tx) => sum + parseInt(tx.amount || 0), 0);
      
    return { debits, credits };
  };

  if (loading) {
    return <div className="loading">Loading journal entries...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="journal-entry-list">
      <div className="page-header">
        <h1>Journal Entries</h1>
        <div className="button-group">
          <Link to="/create-journal-entry" className="button">
            <IconPlus size={16} />
            <span>Create Journal Entry</span>
          </Link>
          <Link to="/send-and-record" className="button button-secondary">
            <IconPlus size={16} />
            <span>Send & Record</span>
          </Link>
        </div>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Transactions</th>
              <th>Amount</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const { debits, credits } = calculateEntryTotals(entry.transactions);
              
              return (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.description}</td>
                  <td>{entry.transactions ? entry.transactions.length : 0}</td>
                  <td>{debits} stake</td>
                  <td>{entry.creator.substring(0, 10)}...</td>
                  <td>
                    <Link to={`/journal-entries/${entry.id}`} className="button button-secondary">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No journal entries found. Create your first entry using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JournalEntryList;