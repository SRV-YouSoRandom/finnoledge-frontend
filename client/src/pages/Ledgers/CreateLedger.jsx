import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateLedger({ user }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    groupName: '',
    openingBalance: '',
    openingBalanceType: 'Debit',
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.fetchGroups();
        setGroups(response.data.Group || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to load account groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for opening balance
    if (name === 'openingBalance' && value && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGroupChange = (e) => {
    const selectedGroupName = e.target.value;
    const selectedGroup = groups.find(group => group.name === selectedGroupName);
    
    // Set default opening balance type based on group type
    let defaultBalanceType = 'Debit';
    if (selectedGroup) {
      if (['Liability', 'Equity', 'Revenue'].includes(selectedGroup.groupType)) {
        defaultBalanceType = 'Credit';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      groupName: selectedGroupName,
      openingBalanceType: defaultBalanceType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!formData.name.trim()) {
      setError('Ledger name is required');
      return;
    }
    
    if (!formData.groupName) {
      setError('Please select an account group');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await cli.createLedger({
        ...formData,
        user
      });
      
      // Success - redirect to ledgers list
      navigate('/ledgers');
    } catch (err) {
      console.error('Error creating ledger:', err);
      setError(err.response?.data?.message || 'Failed to create ledger account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading account groups...</div>;
  }

  return (
    <div className="create-ledger">
      <div className="page-header">
        <h1>Create Ledger Account</h1>
        <Link to="/ledgers" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Ledgers</span>
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
            <label htmlFor="name" className="form-label">Ledger Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter ledger account name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="groupName" className="form-label">Account Group</label>
            <select
              id="groupName"
              name="groupName"
              className="form-select"
              value={formData.groupName}
              onChange={handleGroupChange}
              required
            >
              <option value="">Select Account Group</option>
              {groups.map(group => (
                <option key={group.id} value={group.name}>
                  {group.name} ({group.groupType})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="openingBalance" className="form-label">Opening Balance</label>
              <input
                type="text"
                id="openingBalance"
                name="openingBalance"
                className="form-input"
                value={formData.openingBalance}
                onChange={handleChange}
                placeholder="Enter opening balance (optional)"
              />
              <small className="form-hint">Leave empty for zero balance</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="openingBalanceType" className="form-label">Balance Type</label>
              <select
                id="openingBalanceType"
                name="openingBalanceType"
                className="form-select"
                value={formData.openingBalanceType}
                onChange={handleChange}
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Ledger Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLedger;