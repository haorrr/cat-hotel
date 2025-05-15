import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCat, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={8} lg={6}>
          <div className="not-found-icon mb-4">
            <FaCat className="text-primary" size={120} />
          </div>
          
          <h1 className="mb-3">404</h1>
          <h2 className="mb-4">Trang không tìm thấy</h2>
          
          <p className="lead mb-4">
            Oops! Có vẻ như bạn đã lạc vào một trang không tồn tại. 
            Mèo của chúng tôi đã tìm kiếm khắp nơi nhưng không thể tìm thấy trang này.
          </p>
          
          <Link to="/" className="btn btn-primary btn-lg">
            <FaHome className="me-2" /> Về trang chủ
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
