import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconArrowLeft, IconFileText, IconUserCheck } from '@tabler/icons-react';

function OfferLetterDetails() {
  const { id } = useParams();
  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferLetterDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchOfferLetter(id);
        setOfferLetter(response.data.OfferLetter);
      } catch (error) {
        console.error('Error fetching offer letter details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfferLetterDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'badge-warning',
      'Accepted': 'badge-success',
      'Rejected': 'badge-error'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge-info'}`}>
        {status}
      </span>
    );
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  };

  if (loading) {
    return <div className="loading">Loading offer letter details...</div>;
  }

  if (!offerLetter) {
    return <div className="error-state">Offer letter not found</div>;
  }

  return (
    <div className="offer-letter-details">
      <div className="page-header">
        <Link to="/hr/offer-letters" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Offer Letters</span>
        </Link>
        {offerLetter.status === 'Pending' && (
          <Link to={`/hr/accept-offer/${offerLetter.id}`} className="button">
            <IconUserCheck size={16} />
            <span>Accept Offer</span>
          </Link>
        )}
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconFileText size={24} />
          <h1>Offer Letter #{offerLetter.id}</h1>
          {getStatusBadge(offerLetter.status)}
        </div>
        
        <div className="detail-section">
          <h2>Offer Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Offer ID</div>
              <div className="detail-value">{offerLetter.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Candidate Name</div>
              <div className="detail-value" style={{ fontWeight: '600', fontSize: '18px' }}>
                {offerLetter.candidateName}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{offerLetter.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Annual Salary</div>
              <div className="detail-value" style={{ fontWeight: '600', color: '#1a73e8' }}>
                {formatSalary(offerLetter.salary)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Joining Date</div>
              <div className="detail-value">{offerLetter.joiningDate}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">{getStatusBadge(offerLetter.status)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{offerLetter.creator}</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Offer Summary</h2>
          <div className="card" style={{ 
            backgroundColor: offerLetter.status === 'Accepted' ? '#f0f9f0' : 
                           offerLetter.status === 'Rejected' ? '#fff5f5' : '#fff8e6',
            border: `1px solid ${
              offerLetter.status === 'Accepted' ? '#34a853' : 
              offerLetter.status === 'Rejected' ? '#ea4335' : '#fbbc04'
            }20`
          }}>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <p>
                <strong>Dear {offerLetter.candidateName},</strong>
              </p>
              <p>
                We are pleased to offer you the position of <strong>{offerLetter.position}</strong> with our organization.
              </p>
              <p>
                <strong>Position Details:</strong>
              </p>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>Position: {offerLetter.position}</li>
                <li>Annual Salary: {formatSalary(offerLetter.salary)}</li>
                <li>Expected Joining Date: {offerLetter.joiningDate}</li>
              </ul>
              <p style={{ marginTop: '16px' }}>
                <strong>Current Status:</strong> {offerLetter.status}
              </p>
              {offerLetter.status === 'Pending' && (
                <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#fbbc04' }}>
                  This offer is pending acceptance by the candidate.
                </p>
              )}
              {offerLetter.status === 'Accepted' && (
                <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#34a853' }}>
                  ✓ This offer has been accepted by the candidate.
                </p>
              )}
              {offerLetter.status === 'Rejected' && (
                <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#ea4335' }}>
                  ✗ This offer has been rejected by the candidate.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferLetterDetails;