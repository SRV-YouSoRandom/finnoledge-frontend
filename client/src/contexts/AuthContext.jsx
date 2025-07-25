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

  const login = async (walletAddress, privateKey) => {
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

      if (adminAddresses.includes(walletAddress)) {
        userRole = 'admin';
      } else {
        // Check if this address belongs to an employee
        try {
          // For demo purposes, if the address starts with "emp_", treat as employee
          if (walletAddress.startsWith('emp_')) {
            const employeesResponse = await api.fetchEmployees();
            const employees = employeesResponse.data.Employee || [];
            
            // Try to find employee by matching address pattern
            employeeData = employees.find(emp => 
              walletAddress.includes(emp.employeeId)
            );
            
            // If no exact match, create demo employee data for testing
            if (!employeeData && walletAddress === 'emp_test_employee') {
              employeeData = {
                id: 999,
                name: 'Test Employee',
                employeeId: 'TEST001',
                department: 'Testing Department',
                position: 'Test Position',
                role: 'Employee',
                contactInfo: 'test@example.com'
              };
            } else if (!employeeData && employees.length > 0) {
              // Use first available employee for demo
              employeeData = employees[0];
            }
            
            if (employeeData) {
              userRole = 'employee';
            }
          } else {
            // Try to find by UserAuth if implemented
            try {
              const userAuthResponse = await api.fetchUserAuths();
              const userAuths = userAuthResponse.data.UserAuth || [];
              const userAuth = userAuths.find(auth => auth.address === walletAddress);
              
              if (userAuth) {
                const employeesResponse = await api.fetchEmployees();
                const employees = employeesResponse.data.Employee || [];
                employeeData = employees.find(emp => emp.id.toString() === userAuth.employeeId.toString());
                
                if (employeeData) {
                  userRole = 'employee';
                }
              }
            } catch (authError) {
              console.log('UserAuth not available, using demo mode');
            }
          }
        } catch (error) {
          console.log('Error checking employee status:', error);
        }
      }

      const userData = {
        walletAddress,
        privateKey: privateKey || walletAddress, // For simplicity, using wallet address as key if not provided
        role: userRole,
        employeeData: employeeData,
        loginTime: new Date().toISOString()
      };

      setUser(userData);
      sessionStorage.setItem('erpUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
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