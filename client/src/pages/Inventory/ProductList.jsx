// client/src/pages/Inventory/ProductList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPlus, IconPackage } from '@tabler/icons-react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.fetchProducts();
        setProducts(response.data.Product || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-list">
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/create-product" className="button">
          <IconPlus size={16} />
          <span>Define Product</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Unit of Measure</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <div className="list-item-title">
                    <IconPackage size={16} style={{ marginRight: '8px' }} />
                    {product.name}
                  </div>
                </td>
                <td>{product.description}</td>
                <td>{product.unitOfMeasure}</td>
                <td>{product.creator.substring(0, 10)}...</td>
                <td>
                  <Link to={`/products/${product.id}`} className="button button-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No products found. Define your first product using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;