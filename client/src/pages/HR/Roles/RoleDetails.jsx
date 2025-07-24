import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconArrowLeft, IconBriefcase, IconUsers } from '@tabler/icons-react';

function RoleDetails() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [roleEmployees, setRoleEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch role details
        const roleResponse = await api.fetchRole(id);
        const roleData = roleResponse.data.Role;
        setRole(roleData);
        
        // Fetch all employees to find those with this role
        try {
          const employeesResponse = await api.fetchEmployees();
          const allEmployees = employeesResponse.data.Employee || [];
          setEmployees(allEmployees);
          
          // Filter employees who have this role
          const employeesWithRole = allEmployees.filter(employee => 
            employee.role === roleData.name
          );
          setRoleEmployees(employeesWithRole);
        } catch (employeeError) {
          console.log('No employees found');
          setEmployees([]);
          setRoleEmployees([]);
        }
        
      } catch (error) {
        console.error('Error fetching role details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoleDetails();
  }, [id]);

  const getPermissionBadge = (permissions) => {
    const permissionClasses = {
      'ALL': 'badge-error',
      'SUBMIT_LEAVE': 'badge-info',
      'APPROVE_LEAVE': 'badge-warning',
      'MANAGE_EMPLOYEES': 'badge-success',
      'VIEW_ONLY': 'badge-info'
    };
    
    return (
      <span className={`badge ${permissionClasses[permissions] || 'badge-info'}`}>
        {permissions}
      </span>
    );
  };

  const getPermissionDescription = (permissions) => {
    const descriptions = {
      'ALL': 'Full access to all HR functions',
      'SUBMIT_LEAVE': 'Can submit leave requests only',
      'APPROVE_LEAVE': 'Can approve/reject leave requests',
      'MANAGE_EMPLOYEES': 'Can manage employee records',
      'VIEW_ONLY': 'Read-only access to HR data'
    };
    
    return descriptions[permissions] || 'Custom permissions';
  };

  if (loading) {
    return <div className="loading">Loading role details...</div>;
  }

  if (!role) {
    return <div className="error-state">Role not found</div>;
  }

  return (
    <div className="role-details">
      <div className="page-header">
        <Link to="/hr/roles" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Roles</span>
        </Link>
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconBriefcase size={24} />
          <h1>{role.name}</h1>
          {getPermissionBadge(role.permissions)}
        </div>
        
        <div className="detail-section">
          <h2>Role Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Role ID</div>
              <div className="detail-value">{role.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Role Name</div>
              <div className="detail-value" style={{ fontWeight: '600', fontSize: '18px' }}>
                {role.name}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{role.description}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Permissions</div>
              <div className="detail-value">
                <div style={{ marginBottom: '8px' }}>
                  {getPermissionBadge(role.permissions)}
                </div>
                <div style={{ fontSize: '14px', color: '#3c4043' }}>
                  {getPermissionDescription(role.permissions)}
                </div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{role.creator}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Employees with this Role</div>
              <div className="detail-value" style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1a73e8' 
              }}>
                {roleEmployees.length}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Role Permissions</h2>
          <div className="card" style={{ 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dadce0'
          }}>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <IconBriefcase size={20} style={{ color: '#1a73e8' }} />
                <span style={{ fontWeight: '600' }}>Permission Level: {role.permissions}</span>
              </div>
              <p style={{ margin: '0', color: '#3c4043' }}>
                {getPermissionDescription(role.permissions)}
              </p>
              
              {role.permissions === 'ALL' && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                  <strong style={{ color: '#856404' }}>⚠ High Privilege Role:</strong>
                  <span style={{ color: '#856404' }}> Users with this role have full administrative access to all HR functions.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Employees with this Role</h2>
          {roleEmployees.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Contact Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roleEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <code style={{ 
                        backgroundColor: 'rgba(0,0,0,0.05)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {employee.employeeId}
                      </code>
                    </td>
                    <td>
                      <div className="list-item-title">
                        <IconUsers size={16} style={{ marginRight: '8px' }} />
                        {employee.name}
                      </div>
                    </td>
                    <td>{employee.department || 'Not Assigned'}</td>
                    <td>{employee.position}</td>
                    <td>{employee.contactInfo}</td>
                    <td>
                      <Link to={`/hr/employees/${employee.id}`} className="button button-secondary">
                        View Employee
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              No employees currently have this role assigned.
              <div style={{ marginTop: '16px' }}>
                <Link to="/hr/employees" className="button">
                  <IconUsers size={16} />
                  View All Employees
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleDetails;