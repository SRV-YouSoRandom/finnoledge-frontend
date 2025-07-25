import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { IconArrowLeft, IconKey, IconCopy, IconRefresh, IconEye, IconEyeOff } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function GenerateCredentials() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [credentials, setCredentials] = useState({
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

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
    
    setCredentials({ address, password });
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
    toast.success('New password generated!');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const copyAllCredentials = () => {
    const credentialsText = `Employee Login Credentials
    
Employee: ${employee.name}
Employee ID: ${employee.employeeId}
Login Address: ${credentials.address}
Temporary Password: ${credentials.password}

Please change your password after first login.
Login at: [Your App URL]`;

    navigator.clipboard.writeText(credentialsText).then(() => {
      toast.success('All credentials copied to clipboard!');
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

      <div className="card">
        <div className="card-header">
          <h2>
            <IconKey size={20} />
            <span>Login Credentials</span>
          </h2>
          <button onClick={copyAllCredentials} className="button">
            <IconCopy size={16} />
            Copy All Credentials
          </button>
        </div>

        <div style={{ 
          padding: '24px', 
          backgroundColor: 'rgba(26, 115, 232, 0.05)', 
          border: '2px solid rgba(26, 115, 232, 0.2)', 
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IconKey size={20} />
            Employee Login Details
          </h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Login Address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ 
                  backgroundColor: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  border: '1px solid #dadce0',
                  flex: 1
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
            </div>
            
            <div className="detail-item">
              <div className="detail-label">Temporary Password</div>
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
            ⚠️ Important Instructions
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#856404' }}>
            <li>Share these credentials securely with the employee</li>
            <li>Employee should change the password after first login</li>
            <li>Login address is permanent and cannot be changed</li>
            <li>Store these credentials safely until employee confirms login</li>
          </ul>
        </div>

        <div className="form-actions">
          <button onClick={regeneratePassword} className="button button-secondary">
            <IconRefresh size={16} />
            Generate New Password
          </button>
          <button onClick={copyAllCredentials} className="button">
            <IconCopy size={16} />
            Copy All Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateCredentials;