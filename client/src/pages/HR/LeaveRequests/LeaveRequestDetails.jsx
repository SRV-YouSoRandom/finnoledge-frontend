import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconArrowLeft, IconCalendarTime, IconCheck, IconX, IconClock } from '@tabler/icons-react';

function LeaveRequestDetails() {
  const { id } = useParams();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch leave request details
        const leaveResponse = await api.fetchLeaveRequest(id);
        const leaveData = leaveResponse.data.LeaveRequest;
        setLeaveRequest(leaveData);
        
        console.log('Leave request data:', leaveData);
        
        // Fetch employee details using the employeeId from leave request
        // IMPORTANT: The employeeId in leave request is the system ID (0, 1, 2...)
        try {
          const employeesResponse = await api.fetchEmployees();
          const employees = employeesResponse.data.Employee || [];
          
          console.log('All employees:', employees);
          console.log('Looking for employee with system ID:', leaveData.employeeId);
          
          // Find employee by system ID (leaveData.employeeId matches employee.id)
          const requestEmployee = employees.find(emp => 
            emp.id.toString() === leaveData.employeeId.toString()
          );
          
          if (requestEmployee) {
            setEmployee(requestEmployee);
            console.log('Found employee for leave request:', requestEmployee);
          } else {
            console.log('No employee found for system ID:', leaveData.employeeId);
            console.log('Available employee IDs:', employees.map(emp => emp.id));
            // Don't set this as an error, just log it
          }
        } catch (employeeError) {
          console.log('Error fetching employee details:', employeeError);
          setEmployee(null);
        }
        
      } catch (error) {
        console.error('Error fetching leave request details:', error);
        setError('Failed to load leave request details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequestDetails();
  }, [id]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <IconCheck size={24} style={{ color: '#34a853' }} />;
      case 'Rejected':
        return <IconX size={24} style={{ color: '#ea4335' }} />;
      case 'Pending':
      default:
        return <IconClock size={24} style={{ color: '#fbbc04' }} />;
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const calculateBusinessDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (!isWeekend(currentDate)) {
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return businessDays;
  };

  if (loading) {
    return <div className="loading">Loading leave request details...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        {error}
        <div style={{ marginTop: '16px' }}>
          <Link to="/hr/leave-requests" className="button">
            Back to Leave Requests
          </Link>
        </div>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="error-state">
        Leave request not found
        <div style={{ marginTop: '16px' }}>
          <Link to="/hr/leave-requests" className="button">
            Back to Leave Requests
          </Link>
        </div>
      </div>
    );
  }

  const totalDays = calculateDuration(leaveRequest.startDate, leaveRequest.endDate);
  const businessDays = calculateBusinessDays(leaveRequest.startDate, leaveRequest.endDate);

  return (
    <div className="leave-request-details">
      <div className="page-header">
        <Link to="/hr/leave-requests" className="button button-secondary">
          <IconArrowLeft size={16} />
          <span>Back to Leave Requests</span>
        </Link>
        {leaveRequest.status === 'Pending' && (
          <div className="button-group">
            <Link 
              to={`/hr/process-leave-request/${leaveRequest.id}?action=approve`} 
              className="button"
              style={{ backgroundColor: '#34a853' }}
            >
              <IconCheck size={16} />
              <span>Approve</span>
            </Link>
            <Link 
              to={`/hr/process-leave-request/${leaveRequest.id}?action=reject`} 
              className="button"
              style={{ backgroundColor: '#ea4335' }}
            >
              <IconX size={16} />
              <span>Reject</span>
            </Link>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="detail-header">
          <IconCalendarTime size={24} />
          <h1>Leave Request #{leaveRequest.id}</h1>
          {getStatusBadge(leaveRequest.status)}
        </div>
        
        <div className="detail-section">
          <h2>Request Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Request ID</div>
              <div className="detail-value">{leaveRequest.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Employee System ID</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--primary-color)'
                }}>
                  {leaveRequest.employeeId}
                </code>
              </div>
            </div>
            {employee ? (
              <>
                <div className="detail-item">
                  <div className="detail-label">Employee Name</div>
                  <div className="detail-value" style={{ fontWeight: '600' }}>
                    {employee.name}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">HR Employee ID</div>
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
                  <div className="detail-label">Department</div>
                  <div className="detail-value">{employee.department || 'Not Assigned'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Position</div>
                  <div className="detail-value">{employee.position}</div>
                </div>
              </>
            ) : (
              <div className="detail-item">
                <div className="detail-label">Employee Info</div>
                <div className="detail-value" style={{ color: '#ea4335' }}>
                  Employee details not found for System ID: {leaveRequest.employeeId}
                </div>
              </div>
            )}
            <div className="detail-item">
              <div className="detail-label">Start Date</div>
              <div className="detail-value">{leaveRequest.startDate}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">End Date</div>
              <div className="detail-value">{leaveRequest.endDate}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Duration</div>
              <div className="detail-value" style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1a73e8' 
              }}>
                {totalDays} days
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Business Days</div>
              <div className="detail-value" style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#34a853' 
              }}>
                {businessDays} days
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(leaveRequest.status)}
                  {getStatusBadge(leaveRequest.status)}
                </div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Submitted By</div>
              <div className="detail-value">{leaveRequest.creator}</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Leave Details</h2>
          <div className="card" style={{ 
            backgroundColor: leaveRequest.status === 'Approved' ? '#f0f9f0' : 
                           leaveRequest.status === 'Rejected' ? '#fff5f5' : '#fff8e6',
            border: `1px solid ${
              leaveRequest.status === 'Approved' ? '#34a853' : 
              leaveRequest.status === 'Rejected' ? '#ea4335' : '#fbbc04'
            }20`
          }}>
            <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {getStatusIcon(leaveRequest.status)}
                <span style={{ fontWeight: '600', fontSize: '18px' }}>
                  Leave Request Details
                </span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Reason for Leave:</strong>
                <p style={{ 
                  margin: '8px 0', 
                  padding: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.7)', 
                  borderRadius: '4px',
                  fontStyle: 'italic'
                }}>
                  "{leaveRequest.reason}"
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Leave Period:</strong> {leaveRequest.startDate} to {leaveRequest.endDate}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div>
                  <strong>Total Days:</strong> {totalDays} days
                </div>
                <div>
                  <strong>Business Days:</strong> {businessDays} days
                </div>
                <div>
                  <strong>Weekend Days:</strong> {totalDays - businessDays} days
                </div>
              </div>

              {leaveRequest.status === 'Pending' && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '4px',
                  border: '1px solid #ffeaa7' 
                }}>
                  <strong style={{ color: '#856404' }}>⏳ Pending Approval:</strong>
                  <span style={{ color: '#856404' }}> This leave request is awaiting management approval.</span>
                </div>
              )}

              {leaveRequest.status === 'Approved' && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#d4edda', 
                  borderRadius: '4px',
                  border: '1px solid #c3e6cb' 
                }}>
                  <strong style={{ color: '#155724' }}>✓ Approved:</strong>
                  <span style={{ color: '#155724' }}> This leave request has been approved by management.</span>
                </div>
              )}

              {leaveRequest.status === 'Rejected' && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#f8d7da', 
                  borderRadius: '4px',
                  border: '1px solid #f5c6cb' 
                }}>
                  <strong style={{ color: '#721c24' }}>✗ Rejected:</strong>
                  <span style={{ color: '#721c24' }}> This leave request has been rejected by management.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {employee && (
          <div className="detail-section">
            <h2>Employee Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Employee Name</div>
                <div className="detail-value">{employee.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Position</div>
                <div className="detail-value">{employee.position}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Department</div>
                <div className="detail-value">{employee.department || 'Not Assigned'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact</div>
                <div className="detail-value">{employee.contactInfo}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Link to={`/hr/employees/${employee.id}`} className="button button-secondary">
                View Employee Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequestDetails;