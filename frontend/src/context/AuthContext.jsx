// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api';

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
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await API.get('/me');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('userRole', response.data.role);
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await API.post('/login', { email, password });
      const { token, user, role, profile_image_url } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      const userData = { ...user, profile_image_url };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'profile_image' && userData[key]) {
          formData.append(key, userData[key]);
        } else if (key !== 'profile_image') {
          formData.append(key, userData[key]);
        }
      });

      const response = await API.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { token, user, role, profile_image_url } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      const userDataWithImage = { ...user, profile_image_url };
      localStorage.setItem('user', JSON.stringify(userDataWithImage));
      
      setToken(token);
      setUser(userDataWithImage);
      
      return { success: true, user: userDataWithImage };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await API.post('/logout');
    } catch (error) {
      // Silent fail
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;