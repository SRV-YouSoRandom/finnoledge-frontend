import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateGroup({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupType: 'Asset',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await cli.createGroup({
        ...formData,
        user // Pass the user (wallet name) for CLI command execution
      });
      
      // Success - redirect to groups list
      navigate('/groups');
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <div className="page-header">
        <h1>Create Account Group</h1>
        <Link to="/groups" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Groups</span>
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
            <label htmlFor="name" className="form-label">Group Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter group name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter group description"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="groupType" className="form-label">Group Type</label>
            <select
              id="groupType"
              name="groupType"
              className="form-select"
              value={formData.groupType}
              onChange={handleChange}
              required
            >
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;