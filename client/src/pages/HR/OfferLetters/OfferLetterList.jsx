import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconPlus, IconFileText } from '@tabler/icons-react';

function OfferLetterList() {
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferLetters = async () => {
      try {
        setLoading(true);
        const response = await api.fetchOfferLetters();
        setOfferLetters(response.data.OfferLetter || []);
      } catch (error) {
        console.error('Error fetching offer letters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfferLetters();
  }, []);

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
    return <div className="loading">Loading offer letters...</div>;
  }

  return (
    <div className="offer-letter-list">
      <div className="page-header">
        <h1>Offer Letters</h1>
        <Link to="/hr/create-offer-letter" className="button">
          <IconPlus size={16} />
          <span>Create Offer Letter</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Candidate Name</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offerLetters.map(offer => (
              <tr key={offer.id}>
                <td>{offer.id}</td>
                <td>
                  <div className="list-item-title">
                    <IconFileText size={16} style={{ marginRight: '8px' }} />
                    {offer.candidateName}
                  </div>
                </td>
                <td>{offer.position}</td>
                <td>{formatSalary(offer.salary)}</td>
                <td>{offer.joiningDate}</td>
                <td>{getStatusBadge(offer.status)}</td>
                <td>{offer.creator.substring(0, 10)}...</td>
                <td>
                  <div className="button-group">
                    <Link to={`/hr/offer-letters/${offer.id}`} className="button button-secondary">
                      View
                    </Link>
                    {offer.status === 'Pending' && (
                      <Link to={`/hr/accept-offer/${offer.id}`} className="button">
                        Accept
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {offerLetters.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-state">
                  No offer letters found. Create your first offer letter using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfferLetterList;