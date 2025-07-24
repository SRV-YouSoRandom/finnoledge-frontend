import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconUsers, IconUserPlus, IconBriefcase } from '@tabler/icons-react';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.fetchEmployees();
        setEmployees(response.data.Employee || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const getRoleBadge = (role) => {
    const roleClasses = {
      'HR Admin': 'badge-info',
      'Employee': 'badge-success',
      'Manager': 'badge-warning'
    };
    
    return (
      <span className={`badge ${roleClasses[role] || 'badge-info'}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employee-list">
      <div className="page-header">
        <h1>Employees</h1>
        <div className="button-group">
          <Link to="/hr/offer-letters" className="button button-secondary">
            <IconUserPlus size={16} />
            <span>View Offer Letters</span>
          </Link>
        </div>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Role</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
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
                <td>{getRoleBadge(employee.role)}</td>
                <td>{employee.contactInfo}</td>
                <td>
                  <div className="button-group">
                    <Link to={`/hr/employees/${employee.id}`} className="button button-secondary">
                      View
                    </Link>
                    <Link to={`/hr/assign-role/${employee.id}`} className="button">
                      <IconBriefcase size={14} />
                      Assign Role
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-state">
                  No employees found. Employees are created when offer letters are accepted.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;