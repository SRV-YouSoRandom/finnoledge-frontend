import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../services/api';
import { IconArrowLeft, IconTrash, IconPlus } from '@tabler/icons-react';

function CreateJournalEntry({ user }) {
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    transactions: [
      { ledgerName: '', entryType: 'Debit', amount: '' },
      { ledgerName: '', entryType: 'Credit', amount: '' }
    ]
  });

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
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

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleTransactionChange = (index, field, value) => {
    const updatedTransactions = [...formData.transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: field === 'amount' ? value.replace(/[^0-9]/g, '') : value
    };
    
    setFormData(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));
  };

  const addTransaction = () => {
    setFormData(prev => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        { ledgerName: '', entryType: 'Debit', amount: '' }
      ]
    }));
  };

  const removeTransaction = (index) => {
    if (formData.transactions.length <= 2) {
      setError('Journal entry must have at least two transactions (debit and credit)');
      return;
    }
    
    const updatedTransactions = formData.transactions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      transactions: updatedTransactions
    }));
  };

  const validateForm = () => {
    // Ensure we have a description
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    // Ensure all transactions have ledger, type, and amount
    for (const transaction of formData.transactions) {
      if (!transaction.ledgerName) {
        setError('All transactions must have a ledger account selected');
        return false;
      }
      if (!transaction.amount) {
        setError('All transactions must have an amount');
        return false;
      }
    }
    
    // Ensure debits equal credits (balanced entry)
    const totalDebits = formData.transactions
      .filter(t => t.entryType === 'Debit')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
      
    const totalCredits = formData.transactions
      .filter(t => t.entryType === 'Credit')
      .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
      
    if (totalDebits !== totalCredits) {
      setError(`Journal entry is not balanced. Debits (${totalDebits}) must equal Credits (${totalCredits})`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Convert transactions array to JSON string for CLI
      const transactionsJson = JSON.stringify(formData.transactions);
      
      await cli.createJournalEntry({
        description: formData.description,
        transactionsJson,
        user
      });
      
      // Success - redirect to journal entries list
      navigate('/journal-entries');
    } catch (err) {
      console.error('Error creating journal entry:', err);
      setError(err.response?.data?.message || 'Failed to create journal entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading ledger accounts...</div>;
  }

  return (
    <div className="create-journal-entry">
      <div className="page-header">
        <h1>Create Journal Entry</h1>
        <Link to="/journal-entries" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Journal Entries</span>
        </Link>
      </div>
      
      <div className="card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              type="text"
              id="description"
              className="form-input"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              placeholder="Enter journal entry description"
            />
          </div>
          
          <div className="transactions-section">
            <h2>Transactions</h2>
            
            <div className="transactions-header">
              <div className="th-ledger">Ledger Account</div>
              <div className="th-type">Type</div>
              <div className="th-amount">Amount</div>
              <div className="th-actions">Actions</div>
            </div>
            
            {formData.transactions.map((transaction, index) => (
              <div key={index} className="transaction-row">
                <div>
                  <select
                    value={transaction.ledgerName}
                    onChange={(e) => handleTransactionChange(index, 'ledgerName', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Ledger Account</option>
                    {ledgers.map(ledger => (
                      <option key={ledger.id} value={ledger.name}>
                        {ledger.name} ({ledger.groupName})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={transaction.entryType}
                    onChange={(e) => handleTransactionChange(index, 'entryType', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={transaction.amount}
                    onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                    className="form-input"
                    required
                    placeholder="Amount"
                  />
                </div>
                
                <div>
                  <button
                    type="button"
                    className="button-icon"
                    onClick={() => removeTransaction(index)}
                    title="Remove Transaction"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="transaction-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={addTransaction}
              >
                <IconPlus size={16} />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Journal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJournalEntry;