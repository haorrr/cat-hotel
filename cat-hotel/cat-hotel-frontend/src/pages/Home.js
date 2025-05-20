import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPaw, FaHotel, FaShower, FaUtensils, FaHeartbeat, FaCheck } from 'react-icons/fa';
import roomService from '../api/roomService';

const Home = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await roomService.getRoomTypes();
        setRoomTypes(response.data);
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold">Khách sạn cao cấp dành cho mèo</h1>
              <p className="lead mb-4">
                Chăm sóc chu đáo và không gian thoải mái cho người bạn lông xù của bạn khi bạn vắng nhà.
              </p>
              <div className="d-flex gap-3">
                <Link to="/rooms" className="btn btn-light btn-lg">
                  Xem phòng
                </Link>
                <Link to="/book-room" className="btn btn-outline-light btn-lg">
                  Đặt phòng ngay
                </Link>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src="/images/cat-hotel-hero.jpg" 
                alt="Cat Hotel" 
                className="img-fluid rounded shadow"
                onError={(e) => {
                  e.target.src = 'https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg';
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Services Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Dịch vụ của chúng tôi</h2>
          <p className="lead">Những dịch vụ tốt nhất dành cho mèo cưng của bạn</p>
        </div>

        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="icon-box mb-3">
                  <FaHotel className="text-primary" size={48} />
                </div>
                <h4>Phòng Sang Trọng</h4>
                <p className="text-muted">
                  Không gian riêng tư, thoải mái với đầy đủ tiện nghi cho mèo cưng của bạn.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="icon-box mb-3">
                  <FaShower className="text-primary" size={48} />
                </div>
                <h4>Spa & Làm Đẹp</h4>
                <p className="text-muted">
                  Dịch vụ tắm, cắt tỉa lông và chăm sóc làm đẹp chuyên nghiệp.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="icon-box mb-3">
                  <FaHeartbeat className="text-primary" size={48} />
                </div>
                <h4>Chăm Sóc Y Tế</h4>
                <p className="text-muted">
                  Giám sát sức khỏe 24/7 và chăm sóc đặc biệt cho mèo có nhu cầu đặc biệt.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Link to="/services" className="btn btn-outline-primary">
            Xem tất cả dịch vụ
          </Link>
        </div>
      </Container>

      {/* Room Types Section */}
      <div className="bg-light py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Loại phòng</h2>
            <p className="lead">Chọn phòng phù hợp nhất cho mèo cưng của bạn</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : (
            <Row>
              {roomTypes.map(roomType => (
                <Col lg={3} md={6} className="mb-4" key={roomType.id}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Img 
                      variant="top" 
                      src={roomType.image_url} 
                      alt={roomType.name}
                      onError={(e) => {
                        e.target.src = `https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg`;
                      }}
                    />
                    <Card.Body className="p-4">
                      <h5>{roomType.name}</h5>
                      <p className="text-muted small">{roomType.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="price">
                          <span className="h5 text-primary">{roomType.price_per_day.toLocaleString()} VNĐ</span>
                          <small className="text-muted"> / ngày</small>
                        </div>
                        <span className="badge bg-light text-dark">{roomType.capacity} mèo</span>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 p-4 pt-0">
                      <Link to="/book-room" className="btn btn-outline-primary w-100">
                        Đặt ngay
                      </Link>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-4">
            <Link to="/rooms" className="btn btn-primary">
              Xem tất cả phòng
            </Link>
          </div>
        </Container>
      </div>

      {/* Testimonials */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Khách hàng nói gì</h2>
          <p className="lead">Những đánh giá từ khách hàng đã sử dụng dịch vụ của chúng tôi</p>
        </div>

        <Carousel 
          className="testimonial-carousel bg-white shadow-sm rounded p-4"
          controls={false}
          indicators={true}
        >
          <Carousel.Item>
            <div className="text-center p-4">
              <div className="mb-4">
                <FaPaw className="text-primary" size={40} />
              </div>
              <p className="lead fst-italic mb-4">
                "Mèo của tôi rất thích thú khi ở tại đây. Nhân viên rất tận tình và chuyên nghiệp. Chắc chắn tôi sẽ quay lại!"
              </p>
              <div>
                <h5 className="mb-1">Nguyễn Văn A</h5>
                <p className="text-muted mb-0">Mèo: Mochi</p>
              </div>
            </div>
          </Carousel.Item>
          
          <Carousel.Item>
            <div className="text-center p-4">
              <div className="mb-4">
                <FaPaw className="text-primary" size={40} />
              </div>
              <p className="lead fst-italic mb-4">
                "Phòng sạch sẽ và thoải mái. Mèo của tôi được chăm sóc rất tốt. Tôi có thể yên tâm đi công tác mà không lo lắng gì."
              </p>
              <div>
                <h5 className="mb-1">Trần Thị B</h5>
                <p className="text-muted mb-0">Mèo: Luna</p>
              </div>
            </div>
          </Carousel.Item>
          
          <Carousel.Item>
            <div className="text-center p-4">
              <div className="mb-4">
                <FaPaw className="text-primary" size={40} />
              </div>
              <p className="lead fst-italic mb-4">
                "Dịch vụ spa cho mèo tuyệt vời! Nhân viên rất kiên nhẫn với mèo của tôi, mặc dù nó khá khó tính. Kết quả rất đáng kinh ngạc."
              </p>
              <div>
                <h5 className="mb-1">Lê Văn C</h5>
                <p className="text-muted mb-0">Mèo: Kitty</p>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </Container>

      {/* CTA Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="display-6 fw-bold mb-4">Sẵn sàng đặt phòng cho mèo cưng của bạn?</h2>
              <p className="lead mb-4">
                Đừng để mèo cưng của bạn phải chờ đợi. Đặt phòng ngay hôm nay để có trải nghiệm tốt nhất!
              </p>
              <Link to="/book-room" className="btn btn-light btn-lg">
                Đặt phòng ngay
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Home;
