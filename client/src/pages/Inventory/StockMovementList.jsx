// client/src/pages/Inventory/StockMovementList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPlus, IconTrendingUp, IconTrendingDown, IconRefresh } from '@tabler/icons-react';

function StockMovementList() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const response = await api.fetchStockMovements();
        setMovements(response.data.StockMovementLog || []);
      } catch (error) {
        console.error('Error fetching stock movements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovements();
  }, []);

  const getMovementIcon = (movementType) => {
    switch (movementType) {
      case 'RECEIPT':
        return <IconTrendingUp size={16} style={{ color: '#34a853' }} />;
      case 'ISSUE':
        return <IconTrendingDown size={16} style={{ color: '#ea4335' }} />;
      case 'ADJUST_POSITIVE':
        return <IconTrendingUp size={16} style={{ color: '#4285f4' }} />;
      case 'ADJUST_NEGATIVE':
        return <IconTrendingDown size={16} style={{ color: '#fbbc04' }} />;
      default:
        return <IconRefresh size={16} />;
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

  if (loading) {
    return <div className="loading">Loading stock movements...</div>;
  }

  return (
    <div className="stock-movement-list">
      <div className="page-header">
        <h1>Stock Movement Log</h1>
        <Link to="/record-stock-movement" className="button">
          <IconPlus size={16} />
          <span>Record Movement</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Movement</th>
              <th>Quantity</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(movement => (
              <tr key={movement.id}>
                <td>{movement.id}</td>
                <td>
                  <div className="list-item-title">
                    {movement.productName}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getMovementIcon(movement.movementType)}
                    {getMovementBadge(movement.movementType)}
                  </div>
                </td>
                <td style={{ fontWeight: '500' }}>
                  {movement.quantity}
                </td>
                <td>{movement.description}</td>
                <td>
                  <code style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {movement.reference}
                  </code>
                </td>
                <td>{movement.creator.substring(0, 10)}...</td>
                <td>
                  <Link to={`/stock-movements/${movement.id}`} className="button button-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-state">
                  No stock movements found. Record your first movement using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockMovementList;