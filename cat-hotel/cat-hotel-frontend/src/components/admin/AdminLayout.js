import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Button } from 'react-bootstrap';
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaBed, 
  FaUsers, 
  FaBars, 
  FaTimes, 
  FaCat, 
  FaSignOutAlt,
  FaChevronLeft
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo d-flex align-items-center">
            <FaCat size={24} className="me-2" />
            <h5 className="mb-0">Cat Hotel Admin</h5>
          </div>
          <Button 
            variant="link" 
            className="close-sidebar d-md-none"
            onClick={toggleSidebar}
          >
            <FaTimes />
          </Button>
        </div>

        <div className="sidebar-content">
          <Nav className="flex-column">
            <Nav.Item>
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <FaTachometerAlt className="me-3" /> Dashboard
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/bookings" 
                className={`nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}
              >
                <FaCalendarAlt className="me-3" /> Đặt phòng
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/rooms" 
                className={`nav-link ${isActive('/admin/rooms') ? 'active' : ''}`}
              >
                <FaBed className="me-3" /> Phòng
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/users" 
                className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
              >
                <FaUsers className="me-3" /> Người dùng
              </Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="sidebar-footer">
          <Nav className="flex-column">
            <Nav.Item>
              <Link to="/" className="nav-link">
                <FaChevronLeft className="me-3" /> Về trang chủ
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Button 
                variant="link" 
                className="nav-link text-danger" 
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-3" /> Đăng xuất
              </Button>
            </Nav.Item>
          </Nav>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main">
        <div className="admin-navbar">
          <Button 
            variant="light" 
            className="toggle-sidebar"
            onClick={toggleSidebar}
          >
            <FaBars />
          </Button>
        </div>

        <div className="admin-content">
          {children}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx="true">{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        .admin-sidebar {
          width: 260px;
          background-color: #343a40;
          color: white;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .admin-sidebar.closed {
          margin-left: -260px;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-content {
          flex: 1;
          padding: 20px 0;
        }

        .sidebar-footer {
          padding: 10px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-sidebar .nav-link {
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .admin-sidebar .nav-link:hover,
        .admin-sidebar .nav-link.active {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #f8f9fa;
        }

        .admin-navbar {
          padding: 10px 20px;
          background-color: white;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
        }

        .admin-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            height: 100vh;
          }
          
          .admin-sidebar.closed {
            margin-left: -260px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;