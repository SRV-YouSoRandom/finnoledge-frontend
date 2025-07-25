// client/src/components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconUser, IconKey, IconEye, IconEyeOff } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Login() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.loginId.trim()) {
      setError('Login ID is required');
      return;
    }

    try {
      const result = await login(formData.loginId.trim(), formData.password.trim());
      
      if (result.success) {
        const userType = result.user.role === 'admin' ? 'Administrator' : 'Employee';
        toast.success(`Welcome! Logged in as ${userType}`, {
          duration: 3000,
          position: 'bottom-right'
        });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login');
    }
  };

  // Demo accounts for easy testing
  const demoAccounts = [
    { 
      label: 'Admin Demo', 
      loginId: 'bob', 
      password: 'demo-key',
      description: 'Full admin access',
      note: 'Use wallet address as login'
    },
    { 
      label: 'Employee Demo (System ID: 0)', 
      loginId: '0', 
      password: 'newPassword123',
      description: 'First employee account (if exists)',
      note: 'System-generated ID'
    },
    { 
      label: 'Employee Demo (System ID: 1)', 
      loginId: '1', 
      password: 'newPassword123',
      description: 'Second employee account (if exists)',
      note: 'System-generated ID'
    },
    { 
      label: 'Employee Demo (System ID: 2)', 
      loginId: '2', 
      password: 'temp123',
      description: 'Third employee account (if exists)',
      note: 'Default password'
    }
  ];

  const fillDemoAccount = (account) => {
    setFormData({
      loginId: account.loginId,
      password: account.password
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--content-bg)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: 'var(--primary-color)',
            margin: '0 0 8px 0'
          }}>
            Verinet ERP
          </h1>
          <p style={{ 
            color: 'var(--secondary-color)', 
            margin: '0',
            fontSize: '14px' 
          }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginId" className="form-label">
              <IconUser size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Login ID
            </label>
            <input
              type="text"
              id="loginId"
              name="loginId"
              className="form-input"
              value={formData.loginId}
              onChange={handleChange}
              required
              placeholder="Admin: wallet address | Employee: system ID (0, 1, 2...)"
              autoComplete="username"
            />
            <span className="form-hint">
              <strong>Admins:</strong> Use wallet address (e.g., bob) |{' '}
              <strong>Employees:</strong> Use your <u>System ID</u> (0, 1, 2...) - <strong>NOT</strong> your HR Employee ID (EMP001...)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <IconKey size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
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
            <span className="form-hint">
              Employees: Use password generated by HR after offer acceptance
            </span>
          </div>

          <button 
            type="submit" 
            className="button" 
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '20px',
              fontSize: '16px',
              padding: '12px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Critical ID Explanation */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: 'rgba(234, 67, 53, 0.1)', 
          borderRadius: '8px',
          border: '2px solid rgba(234, 67, 53, 0.3)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ea4335', fontSize: '14px' }}>
            ⚠️ IMPORTANT: Employee Login ID
          </h4>
          <div style={{ fontSize: '12px', color: '#721c24', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Use SYSTEM ID, not HR Employee ID:</strong>
            </div>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              <li><strong>✅ Correct:</strong> System ID like <code>0</code>, <code>1</code>, <code>2</code> (auto-generated by blockchain)</li>
              <li><strong>❌ Wrong:</strong> HR Employee ID like <code>EMP001</code>, <code>EMP123</code> (assigned by HR)</li>
            </ul>
            <div style={{ marginTop: '8px', fontSize: '11px' }}>
              Your System ID is shown in your employee portal after successful login.
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            color: 'var(--secondary-color)', 
            marginBottom: '16px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px'
          }}>
            Demo Accounts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillDemoAccount(account)}
                className="button button-secondary"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                  {account.label}
                </div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>
                  {account.description}
                </div>
                <div style={{ fontSize: '11px', opacity: '0.7', marginTop: '2px' }}>
                  Login: <code>{account.loginId}</code> | Password: <code>{account.password}</code>
                </div>
                <div style={{ fontSize: '10px', opacity: '0.6', marginTop: '1px', fontStyle: 'italic' }}>
                  {account.note}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: 'rgba(26, 115, 232, 0.05)', 
          borderRadius: '8px',
          border: '1px solid rgba(26, 115, 232, 0.2)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', fontSize: '14px' }}>
            Login Instructions:
          </h4>
          <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '12px', color: 'var(--secondary-color)' }}>
            <li><strong>Administrators:</strong> Use your wallet address (e.g., "bob") and private key</li>
            <li><strong>Employees:</strong> Use your <strong>System ID</strong> (0, 1, 2...) and HR-generated password</li>
            <li><strong>System ID vs HR Employee ID:</strong>
              <ul style={{ marginTop: '4px', marginLeft: '12px' }}>
                <li>System ID: Auto-generated by blockchain (0, 1, 2...) ← Use this for login</li>
                <li>HR Employee ID: Assigned by HR (EMP001, EMP123...) ← Display only</li>
              </ul>
            </li>
            <li>Contact HR if you don't have your login credentials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;