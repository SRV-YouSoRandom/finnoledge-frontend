import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateOfferLetter({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    salary: '',
    joiningDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for salary
    if (name === 'salary' && value && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate salary
    if (!formData.salary || parseInt(formData.salary) <= 0) {
      setError('Please enter a valid salary amount');
      setLoading(false);
      return;
    }

    try {
      await cli.createOfferLetter({
        ...formData,
        salary: parseInt(formData.salary),
        user
      });
      
      // Success - redirect to offer letters list
      navigate('/hr/offer-letters');
    } catch (err) {
      console.error('Error creating offer letter:', err);
      setError(err.response?.data?.message || 'Failed to create offer letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="create-offer-letter">
      <div className="page-header">
        <h1>Create Offer Letter</h1>
        <Link to="/hr/offer-letters" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Offer Letters</span>
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
            <label htmlFor="candidateName" className="form-label">Candidate Name *</label>
            <input
              type="text"
              id="candidateName"
              name="candidateName"
              className="form-input"
              value={formData.candidateName}
              onChange={handleChange}
              required
              placeholder="Enter candidate's full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="position" className="form-label">Position *</label>
            <input
              type="text"
              id="position"
              name="position"
              className="form-input"
              value={formData.position}
              onChange={handleChange}
              required
              placeholder="e.g., Software Engineer, Marketing Manager"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary" className="form-label">Annual Salary (USD) *</label>
              <input
                type="text"
                id="salary"
                name="salary"
                className="form-input"
                value={formData.salary}
                onChange={handleChange}
                required
                placeholder="e.g., 80000"
              />
              <span className="form-hint">
                Enter annual salary in USD (numbers only)
              </span>
            </div>
            
            <div className="form-group">
              <label htmlFor="joiningDate" className="form-label">Joining Date *</label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                className="form-input"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                min={today}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Offer Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOfferLetter;