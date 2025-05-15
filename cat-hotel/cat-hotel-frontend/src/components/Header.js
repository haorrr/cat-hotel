import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCat, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { currentUser, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaCat className="me-2" /> Cat Hotel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/rooms">Danh sách phòng</Nav.Link>
            <Nav.Link as={Link} to="/services">Dịch vụ</Nav.Link>
            <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
            <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>
          </Nav>
          
          <Nav>
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin">Quản trị</Nav.Link>
                )}
                <NavDropdown 
                  title={
                    <span>
                      <FaUserCircle className="me-1" />
                      {currentUser.name}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/dashboard">Bảng điều khiển</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/bookings">Đơn đặt phòng</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/cats">Mèo của tôi</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile">Tài khoản</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
