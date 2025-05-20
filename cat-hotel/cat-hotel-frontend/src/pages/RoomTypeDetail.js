import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Carousel, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaCat, FaMoneyBillWave, FaArrowLeft, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import roomService from '../api/roomService';

const RoomTypeDetail = () => {
  const { id } = useParams();
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoomType = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await roomService.getRoomTypeById(id);
        setRoomType(response.data);
      } catch (error) {
        console.error('Error fetching room type:', error);
        setError('Không thể tải thông tin loại phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRoomType();
    }
  }, [id]);

  // Mảng ảnh mẫu (trong trường hợp không có nhiều ảnh)
  const sampleImages = [
    roomType?.image_url,
    '/images/cat-room-1.jpg',
    '/images/cat-room-2.jpg',
  ].filter(Boolean);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin phòng...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/rooms" className="btn btn-primary">
          <FaArrowLeft className="me-2" /> Quay lại danh sách phòng
        </Link>
      </Container>
    );
  }

  if (!roomType) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">Không tìm thấy thông tin loại phòng.</div>
        <Link to="/rooms" className="btn btn-primary">
          <FaArrowLeft className="me-2" /> Quay lại danh sách phòng
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4">
        <Link to="/rooms" className="text-decoration-none">
          <FaArrowLeft className="me-2" /> Quay lại danh sách phòng
        </Link>
      </div>
      
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="mb-3">
                {roomType.name}
                <Badge 
                  bg="info" 
                  className="ms-3 align-middle" 
                  style={{ fontSize: '0.9rem' }}
                >
                  <FaCat className="me-1" /> {roomType.capacity} mèo
                </Badge>
              </h2>
              
              <div className="mb-4">
                {sampleImages.length > 0 ? (
                  <Carousel className="room-carousel">
                    {sampleImages.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={image}
                          alt={`${roomType.name} - Ảnh ${index + 1}`}
                          style={{ 
                            height: '400px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            e.target.src = `https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg`;
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="bg-light text-center py-5 rounded">
                    <p className="text-muted mb-0">Không có hình ảnh.</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h4>Mô tả</h4>
                <p>{roomType.description || 'Không có mô tả chi tiết cho loại phòng này.'}</p>
              </div>
              
              <div className="mb-4">
                <h4>Tiện ích phòng</h4>
                <Row className="mt-3">
                  <Col md={6}>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Chăm sóc y tế 24/7
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Thức ăn cao cấp
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Khu vực chơi đùa
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Cát vệ sinh thay hàng ngày
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Camera theo dõi
                      </ListGroup.Item>
                      <ListGroup.Item className="border-0 ps-0">
                        <FaCheck className="text-success me-2" /> Cây leo và đồ chơi
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h3 className="text-primary mb-4">
                <FaMoneyBillWave className="me-2" />
                {Number(roomType.price_per_day).toLocaleString()} VNĐ
                <small className="text-muted"> / ngày</small>
              </h3>
              
              <div className="d-grid gap-2">
                <Link to="/book-room" className="btn btn-primary btn-lg">
                  <FaCalendarAlt className="me-2" /> Đặt phòng ngay
                </Link>
              </div>
              
              <hr />
              
              <h5>Thông tin phòng</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                  <span>Loại phòng:</span>
                  <span className="fw-bold">{roomType.name}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                  <span>Sức chứa:</span>
                  <span className="fw-bold">{roomType.capacity} mèo</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                  <span>Giá phòng:</span>
                  <span className="fw-bold">{Number(roomType.price_per_day).toLocaleString()} VNĐ/ngày</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Cần giúp đỡ?</h5>
              <p className="mb-3">Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.</p>
              <div className="d-grid">
                <Link to="/contact" className="btn btn-outline-primary">
                  Liên hệ chúng tôi
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="mt-5">
        <h3 className="mb-4">Các loại phòng khác</h3>
        <Row>
          {/* Đây là phần có thể hiển thị các loại phòng khác - sẽ được cập nhật sau */}
          <Col md={4} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Img 
                variant="top" 
                src="/images/sample-room.jpg" 
                alt="Sample Room"
                onError={(e) => {
                  e.target.src = "https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg";
                }}
              />
              <Card.Body>
                <Card.Title>Phòng Standard</Card.Title>
                <Card.Text className="text-muted small">
                  Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản cho mèo cưng của bạn.
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="price">
                    <span className="fw-bold">200,000 VNĐ</span>
                    <small className="text-muted"> / ngày</small>
                  </div>
                  <Badge bg="light" text="dark">1 mèo</Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <Link to="/room-type/1" className="btn btn-outline-primary w-100">
                  Xem chi tiết
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default RoomTypeDetail;