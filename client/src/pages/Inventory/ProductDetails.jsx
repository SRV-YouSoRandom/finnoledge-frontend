// client/src/pages/Inventory/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconArrowLeft, IconPackage, IconPlus } from '@tabler/icons-react';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [stockEntry, setStockEntry] = useState(null);
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
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

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
        <div className="detail-header">
          <IconPackage size={24} />
          <h1>{product.name}</h1>
        </div>
        
        <div className="detail-section">
          <h2>Product Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">{product.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{product.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{product.description || 'No description'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Unit of Measure</div>
              <div className="detail-value">{product.unitOfMeasure}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{product.creator}</div>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Current Stock</h2>
          <div className="card" style={{ backgroundColor: '#f8fffe' }}>
            {stockEntry ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Quantity on Hand</div>
                  <div className="detail-value" style={{ fontSize: '24px', fontWeight: '600', color: '#1a73e8' }}>
                    {stockEntry.quantityOnHand} {product.unitOfMeasure}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Product Name</div>
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
      </div>
    </div>
  );
}

export default ProductDetails;