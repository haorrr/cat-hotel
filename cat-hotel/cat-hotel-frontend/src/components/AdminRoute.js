import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component bảo vệ các route chỉ dành cho admin
const AdminRoute = ({ children }) => {
  const { isLoggedIn, currentUser, loading } = useAuth();
  
  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;