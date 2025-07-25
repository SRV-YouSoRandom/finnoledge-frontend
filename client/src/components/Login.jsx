import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconUser, IconKey, IconEye, IconEyeOff } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Login() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    walletAddress: '',
    privateKey: ''
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
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

    if (!formData.walletAddress.trim()) {
      setError('Wallet address is required');
      return;
    }

    try {
      const result = await login(formData.walletAddress.trim(), formData.privateKey.trim());
      
      if (result.success) {
        toast.success(`Welcome! Logged in as ${result.user.role}`, {
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
      address: 'bob', 
      key: 'demo-key',
      description: 'Full admin access' 
    },
    { 
      label: 'Employee Demo', 
      address: 'emp_EMP001_0', 
      key: 'temp123',
      description: 'Employee access (use after creating employee)' 
    },
    { 
      label: 'Test Employee', 
      address: 'emp_test_employee', 
      key: 'test123',
      description: 'Test employee account' 
    }
  ];

  const fillDemoAccount = (account) => {
    setFormData({
      walletAddress: account.address,
      privateKey: account.key
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
        maxWidth: '400px',
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
            <label htmlFor="walletAddress" className="form-label">
              <IconUser size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              className="form-input"
              value={formData.walletAddress}
              onChange={handleChange}
              required
              placeholder="Enter your wallet address"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="privateKey" className="form-label">
              <IconKey size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Private Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPrivateKey ? 'text' : 'password'}
                id="privateKey"
                name="privateKey"
                className="form-input"
                value={formData.privateKey}
                onChange={handleChange}
                placeholder="Enter your private key or password"
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
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
                {showPrivateKey ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            <span className="form-hint">
              For employees: use your generated address and password
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

        {/* Demo Accounts */}
        <div style={{ marginTop: '32px' }}>
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;