// client/src/pages/Inventory/CreateProduct.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateProduct({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitOfMeasure: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      await cli.defineProduct({
        ...formData,
        user // Pass the user (wallet name) for CLI command execution
      });
      
      // Success - redirect to products list
      navigate('/products');
    } catch (err) {
      console.error('Error defining product:', err);
      setError(err.response?.data?.message || 'Failed to define product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product">
      <div className="page-header">
        <h1>Define Product</h1>
        <Link to="/products" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Products</span>
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
            <label htmlFor="name" className="form-label">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter product description"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="unitOfMeasure" className="form-label">Unit of Measure *</label>
            <input
              type="text"
              id="unitOfMeasure"
              name="unitOfMeasure"
              className="form-input"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              required
              placeholder="e.g., Pieces, Units, Kilograms, Liters"
            />
            <span className="form-hint">
              Specify how this product is measured (e.g., Pieces, Units, Kg, etc.)
            </span>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? 'Defining...' : 'Define Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;