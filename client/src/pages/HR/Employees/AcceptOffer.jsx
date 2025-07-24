import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../../services/api';
import { IconArrowLeft, IconUserCheck } from '@tabler/icons-react';

function AcceptOffer({ user }) {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offerLetter, setOfferLetter] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    contactInfo: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfferLetterDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchOfferLetter(offerId);
        const offer = response.data.OfferLetter;
        setOfferLetter(offer);
        
        // Pre-populate employee ID with a suggested format
        setFormData(prev => ({
          ...prev,
          employeeId: `EMP${String(Date.now()).slice(-6)}` // Generate a unique employee ID
        }));
      } catch (error) {
        console.error('Error fetching offer letter details:', error);
        setError('Failed to load offer letter details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfferLetterDetails();
  }, [offerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await cli.acceptOfferLetter({
        offerId: parseInt(offerId),
        employeeId: formData.employeeId,
        contactInfo: formData.contactInfo,
        user
      });
      
      // Success - redirect to employees list
      navigate('/hr/employees');
    } catch (err) {
      console.error('Error accepting offer letter:', err);
      setError(err.response?.data?.message || 'Failed to accept offer letter. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  };

  if (loading) {
    return <div className="loading">Loading offer letter...</div>;
  }

  if (!offerLetter) {
    return <div className="error-state">Offer letter not found</div>;
  }

  if (offerLetter.status !== 'Pending') {
    return (
      <div className="error-state">
        This offer letter has already been {offerLetter.status.toLowerCase()}.
        <div style={{ marginTop: '16px' }}>
          <Link to="/hr/offer-letters" className="button">
            Back to Offer Letters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-offer">
      <div className="page-header">
        <h1>Accept Offer Letter</h1>
        <Link to={`/hr/offer-letters/${offerId}`} className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Offer Details</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-section">
          <h2>Offer Summary</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Candidate Name</div>
              <div className="detail-value" style={{ fontWeight: '600' }}>
                {offerLetter.candidateName}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{offerLetter.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Salary</div>
              <div className="detail-value" style={{ color: '#1a73e8', fontWeight: '600' }}>
                {formatSalary(offerLetter.salary)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Joining Date</div>
              <div className="detail-value">{offerLetter.joiningDate}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Employee Registration Details</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employeeId" className="form-label">Employee ID *</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              className="form-input"
              value={formData.employeeId}
              onChange={handleChange}
              required
              placeholder="e.g., EMP001, EMP123"
            />
            <span className="form-hint">
              Unique identifier for the employee in the system
            </span>
          </div>
          
          <div className="form-group">
            <label htmlFor="contactInfo" className="form-label">Contact Information *</label>
            <input
              type="email"
              id="contactInfo"
              name="contactInfo"
              className="form-input"
              value={formData.contactInfo}
              onChange={handleChange}
              required
              placeholder="employee@example.com"
            />
            <span className="form-hint">
              Primary contact email for the employee
            </span>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting}
            >
              <IconUserCheck size={16} />
              {submitting ? 'Processing...' : 'Accept Offer & Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcceptOffer;