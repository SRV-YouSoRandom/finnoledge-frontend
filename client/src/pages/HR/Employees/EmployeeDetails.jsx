import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconArrowLeft, IconUsers, IconBriefcase, IconCalendarTime, IconKey } from '@tabler/icons-react';


function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch employee details
        const employeeResponse = await api.fetchEmployee(id);
        const employeeData = employeeResponse.data.Employee;
        setEmployee(employeeData);
        
        // Fetch leave requests for this employee
        try {
          const leaveResponse = await api.fetchLeaveRequests();
          const allLeaveRequests = leaveResponse.data.LeaveRequest || [];
          const employeeLeaveRequests = allLeaveRequests.filter(request => 
            request.employeeId === employeeData.id.toString()
          );
          setLeaveRequests(employeeLeaveRequests);
        } catch (leaveError) {
          console.log('No leave requests found for employee');
          setLeaveRequests([]);
        }
        
      } catch (error) {
        console.error('Error fetching employee details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [id]);

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

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'badge-warning',
      'Approved': 'badge-success',
      'Rejected': 'badge-error'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge-info'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="error-state">Employee not found</div>;
  }

  return (
    <div className="employee-details">
      <div className="page-header">
        <Link to="/hr/employees" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Employees</span>
        </Link>
        <div className="button-group">
          <Link to={`/hr/generate-credentials/${employee.id}`} className="button">
            <IconKey size={16} />
            <span>Generate Credentials</span>
          </Link>
        <Link to={`/hr/assign-role/${employee.id}`} className="button">
          <IconBriefcase size={16} />
          <span>Assign Role</span>
        </Link>
        </div>
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconUsers size={24} />
          <h1>{employee.name}</h1>
          {getRoleBadge(employee.role)}
        </div>
        
        <div className="detail-section">
          <h2>Employee Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Employee ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {employee.employeeId}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value" style={{ fontWeight: '600' }}>
                {employee.name}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Department</div>
              <div className="detail-value">{employee.department || 'Not Assigned'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{employee.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Role</div>
              <div className="detail-value">{getRoleBadge(employee.role)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact Information</div>
              <div className="detail-value">{employee.contactInfo}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Created By</div>
              <div className="detail-value">{employee.creator}</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Leave Request History</h2>
          {leaveRequests.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(request => {
                  const startDate = new Date(request.startDate);
                  const endDate = new Date(request.endDate);
                  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.startDate}</td>
                      <td>{request.endDate}</td>
                      <td>{duration} days</td>
                      <td>{request.reason}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <Link to={`/hr/leave-requests/${request.id}`} className="button button-secondary">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              No leave requests found for this employee.
              <div style={{ marginTop: '16px' }}>
                <Link to="/hr/create-leave-request" className="button">
                  <IconCalendarTime size={16} />
                  Submit Leave Request
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;