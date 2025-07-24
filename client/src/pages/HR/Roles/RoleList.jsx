import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconPlus, IconBriefcase } from '@tabler/icons-react';

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await api.fetchRoles();
        setRoles(response.data.Role || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, []);

  if (loading) {
    return <div className="loading">Loading roles...</div>;
  }

  return (
    <div className="role-list">
      <div className="page-header">
        <h1>Roles</h1>
        <Link to="/hr/create-role" className="button">
          <IconPlus size={16} />
          <span>Define Role</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>
                  <div className="list-item-title">
                    <IconBriefcase size={16} style={{ marginRight: '8px' }} />
                    {role.name}
                  </div>
                </td>
                <td>{role.description}</td>
                <td>
                  <code style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {role.permissions}
                  </code>
                </td>
                <td>{role.creator.substring(0, 10)}...</td>
                <td>
                  <Link to={`/hr/roles/${role.id}`} className="button button-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No roles found. Define your first role using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoleList;