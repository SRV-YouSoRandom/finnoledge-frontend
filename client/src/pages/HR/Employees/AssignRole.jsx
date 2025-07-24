import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, cli } from '../../../services/api';
import { IconArrowLeft, IconBriefcase } from '@tabler/icons-react';

function AssignRole({ user }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee details
        const employeeResponse = await api.fetchEmployee(employeeId);
        const employeeData = employeeResponse.data.Employee;
        setEmployee(employeeData);
        
        // Fetch available roles
        const rolesResponse = await api.fetchRoles();
        const rolesData = rolesResponse.data.Role || [];
        setRoles(rolesData);
        
        // Set current role as selected
        setSelectedRole(employeeData.role || '');
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load employee or roles data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!selectedRole) {
      setError('Please select a role');
      setSubmitting(false);
      return;
    }

    try {
      await cli.assignRoleToEmployee({
        employeeId: parseInt(employeeId),
        roleName: selectedRole,
        user
      });
      
      // Success - redirect to employee details
      navigate(`/hr/employees/${employeeId}`);
    } catch (err) {
      console.error('Error assigning role:', err);
      setError(err.response?.data?.message || 'Failed to assign role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleDescription = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.description : '';
  };

  const getRolePermissions = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.permissions : '';
  };

  if (loading) {
    return <div className="loading">Loading employee and roles...</div>;
  }

  if (!employee) {
    return <div className="error-state">Employee not found</div>;
  }

  return (
    <div className="assign-role">
      <div className="page-header">
        <h1>Assign Role</h1>
        <Link to={`/hr/employees/${employeeId}`} className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Employee</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-section">
          <h2>Employee Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Employee Name</div>
              <div className="detail-value" style={{ fontWeight: '600' }}>
                {employee.name}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Employee ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {employee.employeeId}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Current Role</div>
              <div className="detail-value">
                <span className="badge badge-info">{employee.role}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{employee.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Department</div>
              <div className="detail-value">{employee.department || 'Not Assigned'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Assign New Role</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Role *</label>
            <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
              {roles.map(role => (
                <div 
                  key={role.id}
                  className={`card ${selectedRole === role.name ? 'selected' : ''}`}
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer', 
                    border: selectedRole === role.name ? '2px solid #1a73e8' : '1px solid #dadce0',
                    backgroundColor: selectedRole === role.name ? 'rgba(26, 115, 232, 0.05)' : 'white'
                  }}
                  onClick={() => setSelectedRole(role.name)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="radio"
                      name="role"
                      value={role.name}
                      checked={selectedRole === role.name}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{ margin: 0 }}
                    />
                    <IconBriefcase size={20} style={{ color: '#1a73e8' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '16px' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#3c4043', marginBottom: '4px' }}>
                        {role.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        <strong>Permissions:</strong> {role.permissions}
                      </div>
                    </div>
                    {selectedRole === role.name && (
                      <div style={{ color: '#1a73e8', fontWeight: '500' }}>
                        ✓ Selected
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {roles.length === 0 && (
              <div className="empty-state">
                No roles available. Please create roles first.
                <div style={{ marginTop: '16px' }}>
                  <Link to="/hr/create-role" className="button">
                    Create Role
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {selectedRole && (
            <div className="form-group">
              <div className="card" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dadce0' }}>
                <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                  Selected Role: {selectedRole}
                </div>
                <div style={{ fontSize: '14px', color: '#3c4043', marginBottom: '8px' }}>
                  {getRoleDescription(selectedRole)}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  <strong>Permissions:</strong> {getRolePermissions(selectedRole)}
                </div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={submitting || !selectedRole || roles.length === 0}
            >
              <IconBriefcase size={16} />
              {submitting ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignRole;