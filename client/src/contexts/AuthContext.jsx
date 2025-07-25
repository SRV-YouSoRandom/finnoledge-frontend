import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app load
    const storedUser = sessionStorage.getItem('erpUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        sessionStorage.removeItem('erpUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    try {
      setLoading(true);

      // Check if this is an admin wallet (you can define admin addresses)
      const adminAddresses = [
        'erp158e90met7jqga8jwgl80su70hkc88nsy7vvgy0', // Add your admin addresses here
        'bob', // For testing
        'alice' // For testing
      ];

      let userRole = 'employee';
      let employeeData = null;

      // Check if admin first
      if (adminAddresses.includes(loginId)) {
        userRole = 'admin';
        
        const userData = {
          walletAddress: loginId,
          privateKey: password || loginId,
          role: userRole,
          employeeData: null,
          loginTime: new Date().toISOString()
        };

        setUser(userData);
        sessionStorage.setItem('erpUser', JSON.stringify(userData));
        
        return { success: true, user: userData };
      }

      // For employees, check if loginId is a number (employee system ID)
      const employeeSystemId = parseInt(loginId);
      if (isNaN(employeeSystemId)) {
        return { 
          success: false, 
          error: 'Invalid login credentials. Please use your employee ID (0, 1, 2...) and password.' 
        };
      }

      try {
        // Fetch all employees
        const employeesResponse = await api.fetchEmployees();
        const employees = employeesResponse.data.Employee || [];

        // Find employee by system ID (the auto-incremented ID from blockchain)
        const employee = employees.find(emp => emp.id.toString() === employeeSystemId.toString());
        
        if (!employee) {
          return { 
            success: false, 
            error: `No employee found with ID ${employeeSystemId}. Please contact HR.` 
          };
        }

        // Try to fetch user auth records, but don't fail if they don't exist
        let userAuth = null;
        try {
          const userAuthsResponse = await api.fetchUserAuths();
          const userAuths = userAuthsResponse.data.UserAuth || [];
          userAuth = userAuths.find(auth => 
            auth.employeeId.toString() === employee.id.toString()
          );
        } catch (authError) {
          console.log('UserAuth not available, using simple password check');
        }

        // If UserAuth exists, verify with it; otherwise use simple password check
        if (userAuth) {
          // Verify password with UserAuth
          if (userAuth.password !== password) {
            return { 
              success: false, 
              error: 'Invalid password. Please check your credentials or contact HR.' 
            };
          }

          // Check if account is active
          if (userAuth.status !== 'Active') {
            return { 
              success: false, 
              error: `Account is ${userAuth.status.toLowerCase()}. Please contact HR.` 
            };
          }

          const userData = {
            walletAddress: userAuth.address,
            privateKey: password,
            role: 'employee',
            employeeData: employee,
            systemId: employee.id,
            loginTime: new Date().toISOString()
          };

          setUser(userData);
          sessionStorage.setItem('erpUser', JSON.stringify(userData));
          
          return { success: true, user: userData };
        } else {
          // Fallback: simple password check (for demo purposes)
          if (password === 'temp123' || password === employee.employeeId) {
            const userData = {
              walletAddress: `emp_${employee.employeeId}_${employee.id}`,
              privateKey: password,
              role: 'employee',
              employeeData: employee,
              systemId: employee.id,
              loginTime: new Date().toISOString()
            };

            setUser(userData);
            sessionStorage.setItem('erpUser', JSON.stringify(userData));
            
            return { success: true, user: userData };
          } else {
            return { 
              success: false, 
              error: 'Invalid password. Please contact HR for your credentials.' 
            };
          }
        }

      } catch (error) {
        console.error('Error during employee authentication:', error);
        return { 
          success: false, 
          error: 'Unable to verify credentials. Please try again or contact HR.' 
        };
      }

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('erpUser');
  };

  const updateEmployeeData = async () => {
    if (user && user.role === 'employee' && user.employeeData) {
      try {
        const employeesResponse = await api.fetchEmployees();
        const employees = employeesResponse.data.Employee || [];
        const updatedEmployeeData = employees.find(emp => emp.id === user.employeeData.id);
        
        if (updatedEmployeeData) {
          const updatedUser = {
            ...user,
            employeeData: updatedEmployeeData
          };
          setUser(updatedUser);
          sessionStorage.setItem('erpUser', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error updating employee data:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateEmployeeData,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};