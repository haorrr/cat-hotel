import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';
import { useNavigate } from 'react-router-dom';

// Tạo context
const AuthContext = createContext();

// Hook để sử dụng auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  // Hàm đăng ký
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      setCurrentUser(result.data.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Hàm đăng nhập
  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      setCurrentUser(result.data.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  // Hàm cập nhật thông tin profile
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      // Cập nhật currentUser với thông tin mới
      setCurrentUser(prevUser => ({
        ...prevUser,
        name: profileData.name,
        phone: profileData.phone
      }));
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    isLoggedIn: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
