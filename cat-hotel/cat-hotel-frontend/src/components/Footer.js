import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCat, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">
              <FaCat className="me-2" /> Cat Hotel
            </h5>
            <p>Khách sạn cao cấp dành cho những người bạn mèo. Nơi chúng tôi chăm sóc mèo cưng của bạn như chính thành viên trong gia đình.</p>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Liên kết</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-light text-decoration-none">Trang chủ</Link></li>
              <li className="mb-2"><Link to="/rooms" className="text-light text-decoration-none">Phòng</Link></li>
              <li className="mb-2"><Link to="/services" className="text-light text-decoration-none">Dịch vụ</Link></li>
              <li className="mb-2"><Link to="/about" className="text-light text-decoration-none">Giới thiệu</Link></li>
              <li><Link to="/contact" className="text-light text-decoration-none">Liên hệ</Link></li>
            </ul>
          </Col>
          
          <Col md={5}>
            <h5 className="mb-3">Liên hệ với chúng tôi</h5>
            <p className="mb-2">
              <FaMapMarkerAlt className="me-2" />
              123 Đường Mèo, Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="mb-2">
              <FaPhone className="me-2" />
              (0123) 456 789
            </p>
            <p>
              <FaEnvelope className="me-2" />
              info@cathotel.com
            </p>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center">
            <p className="m-0">&copy; {new Date().getFullYear()} Cat Hotel. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
