// client/src/pages/HR/Employees/GenerateCredentials.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, cli } from '../../../services/api';
import { IconArrowLeft, IconKey, IconCopy, IconRefresh, IconEye, IconEyeOff, IconInfo } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function GenerateCredentials({ user }) {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [credentials, setCredentials] = useState({
    systemId: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const response = await api.fetchEmployee(employeeId);
        const employeeData = response.data.Employee;
        setEmployee(employeeData);
        
        // Generate initial credentials
        generateCredentials(employeeData);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        toast.error('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [employeeId]);

  const generateCredentials = (employeeData) => {
    // Generate address based on employee data
    const address = `emp_${employeeData.employeeId}_${employeeData.id}`;
    
    // Generate a random password
    const password = generateRandomPassword();
    
    setCredentials({ 
      systemId: employeeData.id.toString(), // This is the login ID (0, 1, 2...)
      address, 
      password 
    });
  };

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const regeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setCredentials(prev => ({ ...prev, password: newPassword }));
    toast.success('New password generated!', { duration: 2000 });
  };

  const updatePasswordInSystem = async () => {
    if (!credentials.password) {
      toast.error('No password to update');
      return;
    }

    setUpdating(true);
    const loadingToast = toast.loading('Updating password in system...');

    try {
      await cli.changePassword({
        employeeId: parseInt(employeeId),
        newPassword: credentials.password,
        user
      });

      toast.dismiss(loadingToast);
      toast.success('Password updated successfully in the system!', { duration: 3000 });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to update password in system');
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`, { duration: 2000 });
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const copyAllCredentials = () => {
    const credentialsText = `Employee Login Credentials
    
Employee: ${employee.name}
Employee ID: ${employee.employeeId}
System Login ID: ${credentials.systemId}
Generated Address: ${credentials.address}
Temporary Password: ${credentials.password}

IMPORTANT LOGIN INSTRUCTIONS:
- Use System Login ID: ${credentials.systemId}
- Use Password: ${credentials.password}
- Please change your password after first login.

Login at: [Your App URL]`;

    navigator.clipboard.writeText(credentialsText).then(() => {
      toast.success('All credentials copied to clipboard!', { duration: 3000 });
    }).catch(() => {
      toast.error('Failed to copy credentials');
    });
  };

  if (loading) {
    return <div className="loading">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="error-state">Employee not found</div>;
  }

  return (
    <div className="generate-credentials">
      <div className="page-header">
        <h1>Generate Employee Credentials</h1>
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
              <div className="detail-label">Employee ID (HR Assigned)</div>
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
              <div className="detail-label">System ID (Login ID)</div>
              <div className="detail-value">
                <code style={{ 
                  backgroundColor: 'rgba(26, 115, 232, 0.1)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--primary-color)'
                }}>
                  {credentials.systemId}
                </code>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Position</div>
              <div className="detail-value">{employee.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Contact Info</div>
              <div className="detail-value">{employee.contactInfo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        border: '2px solid rgba(26, 115, 232, 0.3)',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <IconInfo size={24} style={{ color: 'var(--primary-color)', marginTop: '2px' }} />
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
              Important: Employee Login Instructions
            </h3>
            <ul style={{ margin: '0', paddingLeft: '16px', color: 'var(--text-color)' }}>
              <li><strong>Login ID:</strong> Employee must use System ID: <code style={{ backgroundColor: 'rgba(26, 115, 232, 0.2)', padding: '2px 4px', borderRadius: '3px' }}>{credentials.systemId}</code></li>
              <li><strong>Password:</strong> Use the generated password below</li>
              <li><strong>Not the HR assigned Employee ID:</strong> <code>{employee.employeeId}</code></li>
              <li>The system ID is auto-generated (0, 1, 2...) based on employee creation order</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>
            <IconKey size={20} />
            <span>Login Credentials</span>
          </h2>
          <div className="button-group">
            <button onClick={copyAllCredentials} className="button button-secondary">
              <IconCopy size={16} />
              Copy All Credentials
            </button>
            <button 
              onClick={updatePasswordInSystem} 
              className="button"
              disabled={updating}
            >
              <IconKey size={16} />
              {updating ? 'Updating...' : 'Update Password in System'}
            </button>
          </div>
        </div>

        <div style={{ 
          padding: '24px', 
          backgroundColor: 'rgba(52, 168, 83, 0.05)', 
          border: '2px solid rgba(52, 168, 83, 0.2)', 
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#34a853',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconKey size={20} />
            Employee Login Details
          </h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Login ID (System ID)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 16px', 
                  borderRadius: '4px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  border: '2px solid #34a853',
                  color: '#34a853',
                  flex: 1
                }}>
                  {credentials.systemId}
                </div>
                <button 
                  onClick={() => copyToClipboard(credentials.systemId, 'Login ID')}
                  className="button-icon"
                >
                  <IconCopy size={16} />
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#34a853', marginTop: '4px', fontWeight: '500' }}>
                ← This is what the employee uses to login
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Generated Password</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <code style={{ 
                    backgroundColor: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: '1px solid #dadce0',
                    display: 'block',
                    paddingRight: '40px'
                  }}>
                    {showPassword ? credentials.password : '••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--secondary-color)',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
                <button 
                  onClick={() => copyToClipboard(credentials.password, 'Password')}
                  className="button-icon"
                >
                  <IconCopy size={16} />
                </button>
                <button 
                  onClick={regeneratePassword}
                  className="button-icon"
                  title="Generate new password"
                >
                  <IconRefresh size={16} />
                </button>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Generated System Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ 
                  backgroundColor: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  border: '1px solid #dadce0',
                  flex: 1,
                  wordBreak: 'break-all'
                }}>
                  {credentials.address}
                </code>
                <button 
                  onClick={() => copyToClipboard(credentials.address, 'Address')}
                  className="button-icon"
                >
                  <IconCopy size={16} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--secondary-color)', marginTop: '4px' }}>
                Internal system address (not used for login)
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(251, 188, 4, 0.1)',
          border: '1px solid rgba(251, 188, 4, 0.3)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
            ⚠️ Important Instructions for Employee
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#856404' }}>
            <li><strong>Login ID:</strong> Use only the System ID: <code>{credentials.systemId}</code></li>
            <li><strong>Password:</strong> Use the generated password above</li>
            <li><strong>Do NOT use:</strong> HR Employee ID ({employee.employeeId}) or wallet address</li>
            <li>Change password after first successful login</li>
            <li>Contact HR if you have trouble logging in</li>
          </ul>
        </div>

        <div className="form-actions">
          <button onClick={regeneratePassword} className="button button-secondary">
            <IconRefresh size={16} />
            Generate New Password
          </button>
          <button onClick={copyAllCredentials} className="button button-secondary">
            <IconCopy size={16} />
            Copy All Credentials
          </button>
          <button 
            onClick={updatePasswordInSystem} 
            className="button"
            disabled={updating}
          >
            <IconKey size={16} />
            {updating ? 'Updating...' : 'Update Password in System'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateCredentials;