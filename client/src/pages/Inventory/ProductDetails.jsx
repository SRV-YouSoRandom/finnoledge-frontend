// client/src/pages/Inventory/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconPackage, IconPlus, IconTrendingUp, IconTrendingDown, IconRefresh } from '@tabler/icons-react';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [stockEntry, setStockEntry] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await api.fetchProduct(id);
        const productData = productResponse.data.Product;
        setProduct(productData);
        
        // Fetch stock entry for this product
        try {
          const stockResponse = await api.fetchStockEntry(productData.name);
          setStockEntry(stockResponse.data.StockEntry);
        } catch (stockError) {
          // Stock entry might not exist, that's ok
          console.log('No stock entry found for product:', productData.name);
          setStockEntry(null);
        }

        // Fetch all stock movements and filter by product name
        try {
          const movementsResponse = await api.fetchStockMovements();
          const allMovements = movementsResponse.data.StockMovementLog || [];
          const productMovements = allMovements.filter(movement => 
            movement.productName === productData.name
          );
          setStockMovements(productMovements);
        } catch (movementsError) {
          console.log('Error fetching stock movements:', movementsError);
          setStockMovements([]);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

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
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="error-state">Product not found</div>;
  }

  return (
    <div className="product-details">
      <div className="page-header">
        <Link to="/products" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <Link to={`/record-stock-movement?product=${product.name}`} className="button">
          <IconPlus size={16} />
          <span>Record Movement</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <IconPackage size={24} />
          <h1 style={{ margin: '0' }}>{product.name}</h1>
        </div>
        
        <div className="detail-section">
          <h2>Product Information</h2>
          <div className="detail-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>ID</div>
              <div className="detail-value">{product.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Name</div>
              <div className="detail-value">{product.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Description</div>
              <div className="detail-value">{product.description || 'No description'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Unit of Measure</div>
              <div className="detail-value">{product.unitOfMeasure}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label" style={{ 
                fontWeight: '500', 
                color: '#3c4043', 
                marginBottom: '4px' 
              }}>Created By</div>
              <div className="detail-value">{product.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Current Stock</h2>
          <div className="card" style={{ backgroundColor: '#f8fffe' }}>
            {stockEntry ? (
              <div className="detail-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px' 
              }}>
                <div className="detail-item">
                  <div className="detail-label" style={{ 
                    fontWeight: '500', 
                    color: '#3c4043', 
                    marginBottom: '4px' 
                  }}>Quantity on Hand</div>
                  <div className="detail-value" style={{ fontSize: '24px', fontWeight: '600', color: '#1a73e8' }}>
                    {stockEntry.quantityOnHand} {product.unitOfMeasure}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label" style={{ 
                    fontWeight: '500', 
                    color: '#3c4043', 
                    marginBottom: '4px' 
                  }}>Product Name</div>
                  <div className="detail-value">{stockEntry.productName}</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                No stock movements recorded for this product yet.
                <div style={{ marginTop: '16px' }}>
                  <Link to={`/record-stock-movement?product=${product.name}`} className="button">
                    Record First Movement
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Stock Movement History</h2>
          <div className="card" style={{ padding: '0' }}>
            {stockMovements.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Movement Type</th>
                    <th>Quantity</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Creator</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map(movement => (
                    <tr key={movement.id}>
                      <td>{movement.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getMovementIcon(movement.movementType)}
                          {getMovementBadge(movement.movementType)}
                        </div>
                      </td>
                      <td style={{ 
                        fontWeight: '500',
                        color: ['ISSUE', 'ADJUST_NEGATIVE'].includes(movement.movementType) ? '#ea4335' : '#34a853'
                      }}>
                        {['ISSUE', 'ADJUST_NEGATIVE'].includes(movement.movementType) ? '-' : '+'}{movement.quantity}
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
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                No stock movements found for this product.
                <div style={{ marginTop: '16px' }}>
                  <Link to={`/record-stock-movement?product=${product.name}`} className="button">
                    Record First Movement
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;