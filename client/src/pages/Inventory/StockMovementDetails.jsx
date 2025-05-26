// client/src/pages/Inventory/StockMovementDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconTrendingUp, IconTrendingDown, IconRefresh, IconPackage } from '@tabler/icons-react';

function StockMovementDetails() {
  const { id } = useParams();
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovementDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchStockMovement(id);
        setMovement(response.data.StockMovementLog);
      } catch (error) {
        console.error('Error fetching stock movement details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovementDetails();
  }, [id]);

  const getMovementIcon = (movementType) => {
    switch (movementType) {
      case 'RECEIPT':
        return <IconTrendingUp size={24} style={{ color: '#34a853' }} />;
      case 'ISSUE':
        return <IconTrendingDown size={24} style={{ color: '#ea4335' }} />;
      case 'ADJUST_POSITIVE':
        return <IconTrendingUp size={24} style={{ color: '#4285f4' }} />;
      case 'ADJUST_NEGATIVE':
        return <IconTrendingDown size={24} style={{ color: '#fbbc04' }} />;
      default:
        return <IconRefresh size={24} />;
    }
  };

  const getMovementBadge = (movementType) => {
    const classes = {
      'RECEIPT': 'badge-success',
      'ISSUE': 'badge-error',
      'ADJUST_POSITIVE': 'badge-info',
      'ADJUST_NEGATIVE': 'badge-warning'
    };
    
    return (
      <span className={`badge ${classes[movementType] || 'badge-info'}`}>
        {movementType.replace('_', ' ')}
      </span>
    );
  };

  const getMovementColor = (movementType) => {
    switch (movementType) {
      case 'RECEIPT':
      case 'ADJUST_POSITIVE':
        return '#34a853';
      case 'ISSUE':
        return '#ea4335';
      case 'ADJUST_NEGATIVE':
        return '#fbbc04';
      default:
        return '#1a73e8';
    }
  };

  if (loading) {
    return <div className="loading">Loading stock movement details...</div>;
  }

  if (!movement) {
    return <div className="error-state">Stock movement not found</div>;
  }

  return (
    <div className="stock-movement-details">
      <div className="page-header">
        <Link to="/stock-movements" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Stock Movements</span>
        </Link>
        <Link to={`/record-stock-movement?product=${movement.productName}`} className="button">
          <IconPackage size={16} />
          <span>Record Another Movement</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          {getMovementIcon(movement.movementType)}
          <div>
            <h1 style={{ margin: '0', marginBottom: '4px' }}>Stock Movement #{movement.id}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getMovementBadge(movement.movementType)}
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Movement Information</h2>
          <div className="detail-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Movement ID</div>
              <div className="detail-value">{movement.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Product Name</div>
              <div className="detail-value" style={{ fontWeight: '500' }}>{movement.productName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Movement Type</div>
              <div className="detail-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getMovementIcon(movement.movementType)}
                  <span>{movement.movementType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Quantity</div>
              <div className="detail-value" style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: getMovementColor(movement.movementType)
              }}>
                {['ISSUE', 'ADJUST_NEGATIVE'].includes(movement.movementType) ? '-' : '+'}{movement.quantity}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Description</div>
              <div className="detail-value">{movement.description}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Reference</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  {movement.reference}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Created By</div>
              <div className="detail-value">{movement.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Transaction Impact</h2>
          <div className="card" style={{ 
            backgroundColor: ['RECEIPT', 'ADJUST_POSITIVE'].includes(movement.movementType) 
              ? '#f0f9f0' : '#fff5f5',
            border: `1px solid ${getMovementColor(movement.movementType)}20`
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {getMovementIcon(movement.movementType)}
              <span>
                This movement {['RECEIPT', 'ADJUST_POSITIVE'].includes(movement.movementType) ? 'increased' : 'decreased'} 
                {' '}stock for <strong>{movement.productName}</strong> by <strong>{movement.quantity}</strong> units
              </span>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '14px', 
              color: '#3c4043',
              opacity: 0.8
            }}>
              Movement processed and recorded in the stock ledger with reference: {movement.reference}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockMovementDetails;