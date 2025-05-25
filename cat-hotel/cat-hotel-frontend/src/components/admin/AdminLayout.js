// frontend/src/components/admin/AdminLayout.js - Hoàn thiện
import React, { useState, useEffect } from 'react';
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
  FaChevronLeft,
  FaSpa,
  FaUtensils
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Xử lý responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Trên mobile, sidebar mặc định đóng
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Đóng sidebar khi click vào link trên mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Overlay cho mobile */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo d-flex align-items-center">
            <FaCat size={24} className="me-2 text-primary" />
            <h5 className="mb-0 text-white">Cat Hotel Admin</h5>
          </div>
          <Button 
            variant="link" 
            className="close-sidebar d-md-none text-white"
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
                onClick={handleNavClick}
              >
                <FaTachometerAlt className="me-3" /> Dashboard
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/bookings" 
                className={`nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaCalendarAlt className="me-3" /> Đặt phòng
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/rooms" 
                className={`nav-link ${isActive('/admin/rooms') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaBed className="me-3" /> Phòng
              </Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link 
                to="/admin/users" 
                className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaUsers className="me-3" /> Người dùng
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link 
                to="/admin/services" 
                className={`nav-link ${isActive('/admin/services') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaSpa className="me-3" /> Dịch vụ
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link 
                to="/admin/foods" 
                className={`nav-link ${isActive('/admin/foods') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaUtensils className="me-3" /> Thức ăn
              </Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="sidebar-footer">
          <Nav className="flex-column">
            <Nav.Item>
              <Link 
                to="/" 
                className="nav-link"
                onClick={handleNavClick}
              >
                <FaChevronLeft className="me-3" /> Về trang chủ
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Button 
                variant="link" 
                className="nav-link text-danger w-100 text-start" 
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
            variant="outline-secondary" 
            className="toggle-sidebar"
            onClick={toggleSidebar}
          >
            <FaBars />
          </Button>
          
          <div className="navbar-title ms-3">
            <h6 className="mb-0 text-muted">Quản trị viên</h6>
          </div>
        </div>

        <div className="admin-content">
          <Container fluid>
            {children}
          </Container>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx="true">{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .admin-sidebar {
          width: 260px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          z-index: 999;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
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
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-content {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .sidebar-footer {
          padding: 10px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
        }

        .admin-sidebar .nav-link {
          color: rgba(255, 255, 255, 0.8);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          text-decoration: none;
          margin: 2px 10px;
          border-radius: 8px;
        }

        .admin-sidebar .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .admin-sidebar .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          font-weight: 600;
          border-left: 4px solid #ffd700;
        }

        .admin-sidebar .close-sidebar {
          border: none;
          padding: 5px 10px;
        }

        .admin-sidebar .close-sidebar:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-navbar {
          padding: 15px 20px;
          background-color: white;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle-sidebar {
          border: 1px solid #dee2e6;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }

        .toggle-sidebar:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
        }

        .admin-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #f8f9fa;
        }

        .navbar-title h6 {
          font-weight: 500;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            height: 100vh;
          }
          
          .admin-sidebar.closed {
            margin-left: -260px;
          }

          .admin-main {
            width: 100%;
            margin-left: 0;
          }

          .admin-content {
            padding: 15px;
          }
        }

        /* Tablet styles */
        @media (max-width: 992px) {
          .admin-sidebar {
            width: 240px;
          }
          
          .admin-content {
            padding: 15px;
          }
        }

        /* Small mobile styles */
        @media (max-width: 576px) {
          .admin-navbar {
            padding: 10px 15px;
          }
          
          .admin-content {
            padding: 10px;
          }
        }

        /* Scrollbar styling */
        .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Animation improvements */
        .admin-sidebar .nav-link {
          position: relative;
          overflow: hidden;
        }

        .admin-sidebar .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .admin-sidebar .nav-link:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;