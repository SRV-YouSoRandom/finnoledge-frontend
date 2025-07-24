import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cli } from '../../../services/api';
import { IconArrowLeft } from '@tabler/icons-react';

function CreateRole({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
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

  const handlePermissionSelect = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: permission
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await cli.defineRole({
        ...formData,
        user
      });
      
      // Success - redirect to roles list
      navigate('/hr/roles');
    } catch (err) {
      console.error('Error defining role:', err);
      setError(err.response?.data?.message || 'Failed to define role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const predefinedPermissions = [
    { value: 'ALL', label: 'All Permissions', description: 'Full access to all HR functions' },
    { value: 'SUBMIT_LEAVE', label: 'Submit Leave Requests', description: 'Can submit leave requests only' },
    { value: 'APPROVE_LEAVE', label: 'Approve Leave Requests', description: 'Can approve/reject leave requests' },
    { value: 'MANAGE_EMPLOYEES', label: 'Manage Employees', description: 'Can manage employee records' },
    { value: 'VIEW_ONLY', label: 'View Only', description: 'Read-only access to HR data' },
  ];

  return (
    <div className="create-role">
      <div className="page-header">
        <h1>Define Role</h1>
        <Link to="/hr/roles" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Roles</span>
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
            <label htmlFor="name" className="form-label">Role Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., HR Manager, Team Lead, Junior Developer"
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
              placeholder="Describe the responsibilities and scope of this role"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Permissions *</label>
            <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
              {predefinedPermissions.map(permission => (
                <div 
                  key={permission.value}
                  className={`card ${formData.permissions === permission.value ? 'selected' : ''}`}
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer', 
                    border: formData.permissions === permission.value ? '2px solid #1a73e8' : '1px solid #dadce0',
                    backgroundColor: formData.permissions === permission.value ? 'rgba(26, 115, 232, 0.05)' : 'white'
                  }}
                  onClick={() => handlePermissionSelect(permission.value)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="radio"
                      name="permissions"
                      value={permission.value}
                      checked={formData.permissions === permission.value}
                      onChange={(e) => handlePermissionSelect(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {permission.label}
                      </div>
                      <div style={{ fontSize: '14px', color: '#3c4043' }}>
                        {permission.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="customPermissions" className="form-label">Or enter custom permissions</label>
              <input
                type="text"
                id="customPermissions"
                className="form-input"
                value={formData.permissions}
                onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
                placeholder="Enter custom permission string"
              />
              <span className="form-hint">
                You can select from predefined permissions above or enter a custom permission string
              </span>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? 'Defining...' : 'Define Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRole;