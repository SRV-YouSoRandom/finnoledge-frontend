import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function SendAndRecord({ user }) {
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    denom: 'stake',
    debitLedgerName: '',
    creditLedgerName: '',
    description: ''
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for amount field
    if (name === 'amount' && value && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.toAddress) {
      setError('Recipient address is required');
      return false;
    }
    
    if (!formData.amount) {
      setError('Amount is required');
      return false;
    }
    
    if (!formData.debitLedgerName) {
      setError('Debit ledger account is required');
      return false;
    }
    
    if (!formData.creditLedgerName) {
      setError('Credit ledger account is required');
      return false;
    }
    
    if (!formData.description) {
      setError('Description is required');
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
      await cli.sendAndRecord({
        ...formData,
        user
      });
      
      // Success - redirect to journal entries list
      navigate('/journal-entries');
    } catch (err) {
      console.error('Error in Send and Record transaction:', err);
      setError(err.response?.data?.message || 'Failed to process transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading ledger accounts...</div>;
  }

  return (
    <div className="send-and-record">
      <div className="page-header">
        <h1>Send Tokens and Record Transaction</h1>
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
            <label htmlFor="toAddress" className="form-label">Recipient Address</label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              className="form-input"
              value={formData.toAddress}
              onChange={handleChange}
              required
              placeholder="Enter recipient address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Amount</label>
              <input
                type="text"
                id="amount"
                name="amount"
                className="form-input"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="Enter amount"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="denom" className="form-label">Denomination</label>
              <select
                id="denom"
                name="denom"
                className="form-select"
                value={formData.denom}
                onChange={handleChange}
                required
              >
                <option value="stake">stake</option>
                {/* Add other denominations as needed */}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="debitLedgerName" className="form-label">From</label>
            <select
              id="debitLedgerName"
              name="debitLedgerName"
              className="form-select"
              value={formData.debitLedgerName}
              onChange={handleChange}
              required
            >
              <option value="">Select Debit Account</option>
              {ledgers.map(ledger => (
                <option key={`debit-${ledger.id}`} value={ledger.name}>
                  {ledger.name} ({ledger.groupName})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="creditLedgerName" className="form-label">To</label>
            <select
              id="creditLedgerName"
              name="creditLedgerName"
              className="form-select"
              value={formData.creditLedgerName}
              onChange={handleChange}
              required
            >
              <option value="">Select Credit Account</option>
              {ledgers.map(ledger => (
                <option key={`credit-${ledger.id}`} value={ledger.name}>
                  {ledger.name} ({ledger.groupName})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter transaction description"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Send and Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendAndRecord;