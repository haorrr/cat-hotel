import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaList, FaHome } from 'react-icons/fa';

const BookingSuccess = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm text-center border-0">
            <Card.Body className="p-5">
              <div className="success-icon mb-4">
                <FaCheckCircle className="text-success" size={80} />
              </div>
              
              <h2 className="mb-3">Đặt phòng thành công!</h2>
              
              <p className="lead mb-4">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn đặt phòng của bạn đã được xác nhận.
              </p>
              
              <p className="mb-4">
                Chúng tôi đã gửi email xác nhận cho bạn với đầy đủ thông tin chi tiết đặt phòng. 
                Nhân viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
              
              <div className="d-grid gap-3">
                <Link to="/bookings" className="btn btn-primary">
                  <FaList className="me-2" /> Xem đơn đặt phòng
                </Link>
                <Link to="/" className="btn btn-outline-primary">
                  <FaHome className="me-2" /> Về trang chủ
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingSuccess;
