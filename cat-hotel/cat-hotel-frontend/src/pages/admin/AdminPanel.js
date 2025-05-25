// frontend/src/pages/admin/AdminPanel.js - Updated
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from './AdminDashboard';
import BookingManagement from './BookingManagement';
import BookingDetail from './BookingDetail';
import RoomManagement from './RoomManagement';
import UserManagement from './UserManagement';
import ServiceManagement from './ServiceManagement';
import FoodManagement from './FoodManagement';

const AdminPanel = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/rooms" element={<RoomManagement />} />
        <Route path="/rooms/*" element={<RoomManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/foods" element={<FoodManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPanel;