// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
//   withCredentials: true, // 🔑 crucial! this sends sessionid cookie
// });

// interface User {
//   id: string;
//   name: string;
//   employeeNumber?: string;
//   username?: string;
//   isAdmin: boolean;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (credentials: any, isAdmin: boolean) => Promise<void>;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // Configure axios defaults
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// // axios.defaults.baseURL = API_BASE_URL;

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check for existing session on app load
//     const savedUser = localStorage.getItem('payslip_user');
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (credentials: any, isAdmin: boolean) => {
//     try {
//       setIsLoading(true);
//       const endpoint = isAdmin ? '/admin-login/' : '/login/';
//       const response = await api.post(endpoint, credentials);
      
//       const userData: User = {
//         id: response.data.id || response.data.user_id,
//         name: response.data.employee?.name || response.data.name || response.data.username,
//         employeeNumber: response.data.employee?.empno || response.data.employee_number,
//         username: response.data.username,
//         isAdmin: isAdmin
//       };
      
//       setUser(userData);
//       localStorage.setItem('payslip_user', JSON.stringify(userData));
//       // localStorage.setItem('payslip_token', response.data.token || 'session_active');
      
//       // // Set axios authorization header
//       // if (response.data.token) {
//       //   axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//       // }
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('payslip_user');
//     // localStorage.removeItem('payslip_token');
//     // delete axios.defaults.headers.common['Authorization'];
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Use a single `api` instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true, // 🔑 crucial for sending sessionid cookie
});

interface User {
  id: string;
  name: string;
  employeeNumber?: string;
  username?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any, isAdmin: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ On mount, call backend to check if session is valid
    const checkSession = async () => {
      try {
        const response = await api.get('/me/');
        const data = response.data;

        const userData: User = {
          id: data.id || data.employee?.id || '',
          name: data.employee?.name || data.name || data.username || '',
          employeeNumber: data.employee?.empno || '',
          username: data.username || '',
          isAdmin: data.isAdmin || false,
        };

        setUser(userData);
      } catch (error) {
        // Not authenticated, clear
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: any, isAdmin: boolean) => {
    try {
      setIsLoading(true);
      const endpoint = isAdmin ? '/admin-login/' : '/login/';
      const response = await api.post(endpoint, credentials);

      const userData: User = {
        id: response.data.id || response.data.employee?.id || '',
        name: response.data.employee?.name || response.data.name || response.data.username || '',
        employeeNumber: response.data.employee?.empno || '',
        username: response.data.username || '',
        isAdmin: isAdmin
      };

      setUser(userData);
      localStorage.setItem('payslip_user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('payslip_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
