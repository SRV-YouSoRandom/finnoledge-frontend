// client/src/pages/Inventory/RecordStockMovement.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { cli, api } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function RecordStockMovement({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: searchParams.get('product') || '',
    movementType: 'RECEIPT',
    quantity: '',
    description: '',
    reference: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.fetchProducts();
        setProducts(response.data.Product || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await cli.recordStockMovement({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        user // Pass the user (wallet name) for CLI command execution
      });
      
      // Success - redirect to stock movements list
      navigate('/stock-movements');
    } catch (err) {
      console.error('Error recording stock movement:', err);
      setError(err.response?.data?.message || 'Failed to record stock movement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const movementTypes = [
    { value: 'RECEIPT', label: 'Receipt', description: 'Goods received into inventory' },
    { value: 'ISSUE', label: 'Issue', description: 'Goods issued from inventory' },
    { value: 'ADJUST_POSITIVE', label: 'Positive Adjustment', description: 'Increase stock (e.g., after stock count)' },
    { value: 'ADJUST_NEGATIVE', label: 'Negative Adjustment', description: 'Decrease stock (e.g., damage, loss)' }
  ];

  return (
    <div className="record-stock-movement">
      <div className="page-header">
        <h1>Record Stock Movement</h1>
        <Link to="/stock-movements" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Movements</span>
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
            <label htmlFor="productName" className="form-label">Product *</label>
            <select
              id="productName"
              name="productName"
              className="form-select"
              value={formData.productName}
              onChange={handleChange}
              required
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>
                  {product.name} ({product.unitOfMeasure})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="movementType" className="form-label">Movement Type *</label>
            <select
              id="movementType"
              name="movementType"
              className="form-select"
              value={formData.movementType}
              onChange={handleChange}
              required
            >
              {movementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <span className="form-hint">
              {movementTypes.find(t => t.value === formData.movementType)?.description}
            </span>
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter quantity"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Enter movement description"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reference" className="form-label">Reference *</label>
            <input
              type="text"
              id="reference"
              name="reference"
              className="form-input"
              value={formData.reference}
              onChange={handleChange}
              required
              placeholder="e.g., GRN-001, SO-001, ADJ-001"
            />
            <span className="form-hint">
              Reference number for tracking (e.g., purchase order, sales order, adjustment reference)
            </span>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordStockMovement;