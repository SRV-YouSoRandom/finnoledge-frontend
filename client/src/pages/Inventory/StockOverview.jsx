// client/src/pages/Inventory/StockOverview.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPackage, IconPlus, IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';

function StockOverview() {
  const [stockEntries, setStockEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        
        // Fetch all stock entries
        const stockResponse = await api.fetchStockEntries();
        // Fix: Use lowercase 'stockEntry' from API response
        const stockData = stockResponse.data.stockEntry || [];
        setStockEntries(stockData);
        
        // Fetch all products for reference
        const productsResponse = await api.fetchProducts();
        const productsData = productsResponse.data.Product || [];
        setProducts(productsData);
        
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, []);

  const getProductDetails = (productName) => {
    return products.find(p => p.name === productName);
  };

  const getStockStatus = (quantity) => {
    // Convert quantity to number since API returns string
    const qty = parseInt(quantity, 10) || 0;
    if (qty === 0) return { status: 'Out of Stock', color: '#ea4335', icon: IconAlertCircle };
    if (qty < 10) return { status: 'Low Stock', color: '#fbbc04', icon: IconAlertCircle };
    return { status: 'In Stock', color: '#34a853', icon: IconTrendingUp };
  };

  if (loading) {
    return <div className="loading">Loading stock overview...</div>;
  }

  return (
    <div className="stock-overview">
      <div className="page-header">
        <h1>Stock Overview</h1>
        <div className="button-group">
          <Link to="/record-stock-movement" className="button">
            <IconPlus size={16} />
            <span>Record Movement</span>
          </Link>
          <Link to="/create-product" className="button button-secondary">
            <IconPlus size={16} />
            <span>Define Product</span>
          </Link>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div className="card-header">
            <h2>
              <IconPackage size={20} />
              <span>Total Products</span>
            </h2>
          </div>
          <div className="balance-display">
            {products.length}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconTrendingUp size={20} />
              <span>Products with Stock</span>
            </h2>
          </div>
          <div className="balance-display">
            {stockEntries.filter(s => parseInt(s.quantityOnHand, 10) > 0).length}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>
              <IconAlertCircle size={20} />
              <span>Low/Out of Stock</span>
            </h2>
          </div>
          <div className="balance-display" style={{ color: '#ea4335' }}>
            {stockEntries.filter(s => parseInt(s.quantityOnHand, 10) < 10).length}
          </div>
        </div>
      </div>
      
      {/* Stock Table */}
      <div className="card">
        <div className="card-header">
          <h2>Current Stock Levels</h2>
          <Link to="/products" className="button button-secondary">
            View All Products
          </Link>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Quantity on Hand</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(stock => {
              const product = getProductDetails(stock.productName);
              const status = getStockStatus(stock.quantityOnHand);
              const StatusIcon = status.icon;
              const quantity = parseInt(stock.quantityOnHand, 10) || 0;
              
              return (
                <tr key={stock.productName}>
                  <td>
                    <div className="list-item-title">
                      <IconPackage size={16} style={{ marginRight: '8px' }} />
                      {stock.productName}
                    </div>
                  </td>
                  <td>{product?.description || 'No description'}</td>
                  <td style={{ 
                    fontWeight: '600', 
                    fontSize: '16px',
                    color: quantity === 0 ? '#ea4335' : '#202124'
                  }}>
                    {quantity}
                  </td>
                  <td>{product?.unitOfMeasure || 'Unit'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <StatusIcon size={16} style={{ color: status.color }} />
                      <span style={{ color: status.color, fontWeight: '500' }}>
                        {status.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="button-group">
                      <Link 
                        to={`/record-stock-movement?product=${stock.productName}`} 
                        className="button button-secondary"
                      >
                        Record Movement
                      </Link>
                      {product && (
                        <Link 
                          to={`/products/${product.id}`} 
                          className="button button-secondary"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Show products without stock entries */}
            {products
              .filter(product => !stockEntries.find(stock => stock.productName === product.name))
              .map(product => (
                <tr key={`no-stock-${product.id}`}>
                  <td>
                    <div className="list-item-title">
                      <IconPackage size={16} style={{ marginRight: '8px' }} />
                      {product.name}
                    </div>
                  </td>
                  <td>{product.description || 'No description'}</td>
                  <td style={{ 
                    fontWeight: '600', 
                    fontSize: '16px',
                    color: '#ea4335'
                  }}>
                    0
                  </td>
                  <td>{product.unitOfMeasure || 'Unit'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconAlertCircle size={16} style={{ color: '#ea4335' }} />
                      <span style={{ color: '#ea4335', fontWeight: '500' }}>
                        No Stock
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="button-group">
                      <Link 
                        to={`/record-stock-movement?product=${product.name}`} 
                        className="button button-secondary"
                      >
                        Add Stock
                      </Link>
                      <Link 
                        to={`/products/${product.id}`} 
                        className="button button-secondary"
                      >
                        View Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            
            {/* Empty state when no products exist */}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No products found. Start by defining your first product using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockOverview;