import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, adminOnly = false, employeeOnly = false }) {
  const { user, loading, isAdmin, isEmployee, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by App.jsx
  }

  // Check role-based access
  if (adminOnly && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '20px' }}>
          You don't have permission to access this area. Admin access required.
        </p>
        <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>
          Current role: <strong>{user?.role}</strong>
        </div>
      </div>
    );
  }

  if (employeeOnly && !isEmployee) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--secondary-color)', marginBottom: '20px' }}>
          This area is for employees only.
        </p>
        <div style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>
          Current role: <strong>{user?.role}</strong>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;