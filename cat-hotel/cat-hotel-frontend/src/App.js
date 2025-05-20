import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CatList from './pages/CatList';
import BookRoom from './pages/BookRoom';
import BookingSuccess from './pages/BookingSuccess';
import NotFound from './pages/NotFound';
import RoomsList from './pages/RoomsList';
import RoomTypeDetail from './pages/RoomTypeDetail';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import RoomManagement from './pages/admin/RoomManagement';

// Styles
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          {/* Header will not show on admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Header />} />
          </Routes>
          
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<RoomsList />} />
              <Route path="/room-type/:id" element={<RoomTypeDetail />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/cats" element={<PrivateRoute><CatList /></PrivateRoute>} />
              <Route path="/book-room" element={<PrivateRoute><BookRoom /></PrivateRoute>} />
              <Route path="/booking-success" element={<PrivateRoute><BookingSuccess /></PrivateRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

              <Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Footer will not show on admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;