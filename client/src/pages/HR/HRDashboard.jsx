import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  IconUsers, 
  IconUserPlus, 
  IconClipboardList, 
  IconCalendarTime, 
  IconPlus,
  IconBriefcase,
  IconFileText,
  IconUserCheck
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function HRDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [hrData, setHrData] = useState({
    offerLetters: [],
    employees: [],
    roles: [],
    leaveRequests: []
  });
  const [analytics, setAnalytics] = useState({
    offerLettersByStatus: [],
    leaveRequestsByStatus: [],
    employeesByDepartment: [],
    totals: {
      totalOffers: 0,
      totalEmployees: 0,
      totalRoles: 0,
      pendingLeaveRequests: 0
    }
  });

  useEffect(() => {
    const fetchHRData = async () => {
      try {
        setLoading(true);
        
        const [offersRes, employeesRes, rolesRes, leaveReqRes] = await Promise.all([
          api.fetchOfferLetters().catch(() => ({ data: { OfferLetter: [] } })),
          api.fetchEmployees().catch(() => ({ data: { Employee: [] } })),
          api.fetchRoles().catch(() => ({ data: { Role: [] } })),
          api.fetchLeaveRequests().catch(() => ({ data: { LeaveRequest: [] } }))
        ]);
        
        const fetchedOfferLetters = offersRes.data.OfferLetter || [];
        const fetchedEmployees = employeesRes.data.Employee || [];
        const fetchedRoles = rolesRes.data.Role || [];
        const fetchedLeaveRequests = leaveReqRes.data.LeaveRequest || [];
        
        setHrData({
          offerLetters: fetchedOfferLetters,
          employees: fetchedEmployees,
          roles: fetchedRoles,
          leaveRequests: fetchedLeaveRequests
        });
        
        processAnalytics(fetchedOfferLetters, fetchedEmployees, fetchedRoles, fetchedLeaveRequests);
        
      } catch (error) {
        console.error('Error fetching HR data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHRData();
  }, [user]);

  const processAnalytics = (offerLetters, employees, roles, leaveRequests) => {
    // Offer letters by status
    const offerStatusCount = offerLetters.reduce((acc, offer) => {
      acc[offer.status] = (acc[offer.status] || 0) + 1;
      return acc;
    }, {});
    
    const offerLettersByStatus = Object.entries(offerStatusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColor(status)
    }));

    // Leave requests by status
    const leaveStatusCount = leaveRequests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});
    
    const leaveRequestsByStatus = Object.entries(leaveStatusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColor(status)
    }));

    // Employees by department
    const deptCount = employees.reduce((acc, employee) => {
      const dept = employee.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    const employeesByDepartment = Object.entries(deptCount).map(([dept, count]) => ({
      name: dept,
      count: count
    }));

    const pendingLeaveRequests = leaveRequests.filter(req => req.status === 'Pending').length;

    setAnalytics({
      offerLettersByStatus,
      leaveRequestsByStatus,
      employeesByDepartment,
      totals: {
        totalOffers: offerLetters.length,
        totalEmployees: employees.length,
        totalRoles: roles.length,
        pendingLeaveRequests
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#fbbc04',
      'Accepted': '#34a853',
      'Rejected': '#ea4335',
      'Approved': '#34a853'
    };
    return colors[status] || '#6c757d';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return <div className="loading">Loading HR dashboard...</div>;
  }

  return (
    <div className="hr-dashboard">
      <div className="page-header">
        <h1>HR Dashboard</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="dashboard-summary">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>
                <IconFileText size={20} />
                <span>Offer Letters</span>
              </h2>
            </div>
            <div className="balance-display">{analytics.totals.totalOffers}</div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconUsers size={20} />
                <span>Employees</span>
              </h2>
            </div>
            <div className="balance-display">{analytics.totals.totalEmployees}</div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconBriefcase size={20} />
                <span>Roles</span>
              </h2>
            </div>
            <div className="balance-display">{analytics.totals.totalRoles}</div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2>
                <IconCalendarTime size={20} />
                <span>Pending Leave Requests</span>
              </h2>
            </div>
            <div className="balance-display" style={{ color: '#fbbc04' }}>
              {analytics.totals.pendingLeaveRequests}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Data */}
      <div className="dashboard-grid">
        {/* Offer Letters Status Chart */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconFileText size={20} />
              <span>Offer Letters by Status</span>
            </h2>
          </div>
          {analytics.offerLettersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.offerLettersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.offerLettersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No offer letters data available</div>
          )}
        </div>
        
        {/* Employees by Department */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconUsers size={20} />
              <span>Employees by Department</span>
            </h2>
          </div>
          {analytics.employeesByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.employeesByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1a73e8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No employee data available</div>
          )}
        </div>
        
        {/* Recent Offer Letters */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconFileText size={20} />
              <span>Recent Offer Letters</span>
            </h2>
            <Link to="/hr/offer-letters" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {hrData.offerLetters.slice(0, 5).map(offer => (
              <Link to={`/hr/offer-letters/${offer.id}`} key={offer.id} className="list-item">
                <div className="list-item-title">{offer.candidateName}</div>
                <div className="list-item-subtitle">
                  {offer.position} • Status: {offer.status}
                </div>
              </Link>
            ))}
            {hrData.offerLetters.length === 0 && (
              <div className="empty-state">No offer letters found</div>
            )}
          </div>
        </div>
        
        {/* Recent Leave Requests */}
        <div className="card">
          <div className="card-header">
            <h2>
              <IconCalendarTime size={20} />
              <span>Recent Leave Requests</span>
            </h2>
            <Link to="/hr/leave-requests" className="button button-secondary">View All</Link>
          </div>
          <div className="dashboard-list">
            {hrData.leaveRequests.slice(0, 5).map(request => (
              <Link to={`/hr/leave-requests/${request.id}`} key={request.id} className="list-item">
                <div className="list-item-title">Employee ID: {request.employeeId}</div>
                <div className="list-item-subtitle">
                  {request.startDate} to {request.endDate} • {request.status}
                </div>
              </Link>
            ))}
            {hrData.leaveRequests.length === 0 && (
              <div className="empty-state">No leave requests found</div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="button-group" style={{flexDirection: 'column', gap: '12px'}}>
            <Link to="/hr/create-offer-letter" className="button">
              <IconPlus size={16} />
              <span>Create Offer Letter</span>
            </Link>
            <Link to="/hr/create-role" className="button">
              <IconPlus size={16} />
              <span>Define Role</span>
            </Link>
            <Link to="/hr/create-leave-request" className="button">
              <IconPlus size={16} />
              <span>Submit Leave Request</span>
            </Link>
            <Link to="/hr/employees" className="button button-secondary">
              <IconUsers size={16} />
              <span>View All Employees</span>
            </Link>
          </div>
        </div>
        
        {/* System Overview */}
        <div className="card">
          <div className="card-header">
            <h2>HR System Overview</h2>
          </div>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Total Offer Letters</div>
              <div className="detail-value">{analytics.totals.totalOffers}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Active Employees</div>
              <div className="detail-value">{analytics.totals.totalEmployees}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Defined Roles</div>
              <div className="detail-value">{analytics.totals.totalRoles}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Pending Leaves</div>
              <div className="detail-value">
                <span style={{ color: '#fbbc04' }}>{analytics.totals.pendingLeaveRequests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;