import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

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

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');

      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, phone, password) => {
    const response = await api.post('/auth/login', { email, phone, password });
    if (response.data) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const loginVerify = async (userId, otp) => {
    const response = await api.post('/auth/login-verify', { userId, otp });
    if (response.data?.success) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.success) {
      return { userId: response.data.userId };
    }
    throw new Error(response.data.message);
  };

  const verifyOTP = async (userId, otp) => {
    const response = await api.post('/auth/verify-otp', { userId, otp });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data.message);
  };

  const resendOTP = async (userId) => {
    const response = await api.post('/auth/resend-otp', { userId });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    if (response.data.success) {
      return { userId: response.data.userId };
    }
    throw new Error(response.data.message);
  };

  const verifyResetOTP = async (userId, otp, newPassword) => {
    const response = await api.post('/auth/verify-reset-otp', { userId, otp, newPassword });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginVerify,
      signup,
      verifyOTP,
      resendOTP,
      forgotPassword,
      verifyResetOTP,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

