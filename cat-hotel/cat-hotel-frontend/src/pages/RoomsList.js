import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCat, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import roomService from '../api/roomService';

const RoomsList = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [capacity, setCapacity] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' hoặc 'desc'

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRoomTypes();
      setRoomTypes(response.data);
    } catch (error) {
      console.error('Error fetching room types:', error);
      setError('Không thể tải dữ liệu phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lọc phòng theo các điều kiện
  const filteredRoomTypes = roomTypes
    .filter(roomType => 
      // Lọc theo tên
      roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomType.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(roomType => 
      // Lọc theo khoảng giá
      roomType.price_per_day >= priceRange[0] && roomType.price_per_day <= priceRange[1]
    )
    .filter(roomType => 
      // Lọc theo sức chứa
      capacity === 0 || roomType.capacity >= capacity
    )
    .sort((a, b) => 
      // Sắp xếp theo giá
      sortOrder === 'asc' 
        ? a.price_per_day - b.price_per_day 
        : b.price_per_day - a.price_per_day
    );

  // Xử lý thay đổi khoảng giá
  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    
    setPriceRange(prev => {
      if (name === 'min') {
        return [parseInt(value), prev[1]];
      } else {
        return [prev[0], parseInt(value)];
      }
    });
  };

  // Tìm giá cao nhất trong danh sách phòng
  const maxPrice = Math.max(...roomTypes.map(room => room.price_per_day), 1000000);

  return (
    <Container className="py-5">
      <h2 className="mb-4">Danh sách phòng</h2>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Bộ lọc</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Tìm kiếm</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm phòng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Khoảng giá (VNĐ/ngày)</Form.Label>
                  <Row>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Tối thiểu"
                        name="min"
                        value={priceRange[0]}
                        onChange={handlePriceRangeChange}
                        min={0}
                        max={priceRange[1]}
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Tối đa"
                        name="max"
                        value={priceRange[1]}
                        onChange={handlePriceRangeChange}
                        min={priceRange[0]}
                        max={maxPrice}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Sức chứa</Form.Label>
                  <Form.Select
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                  >
                    <option value={0}>Tất cả</option>
                    <option value={1}>1 mèo</option>
                    <option value={2}>2 mèo trở lên</option>
                    <option value={4}>4 mèo trở lên</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Sắp xếp theo giá</Form.Label>
                  <div className="d-flex">
                    <Button
                      variant={sortOrder === 'asc' ? 'primary' : 'outline-primary'}
                      className="me-2 flex-grow-1"
                      onClick={() => setSortOrder('asc')}
                    >
                      <FaSortAmountUp className="me-2" /> Thấp đến cao
                    </Button>
                    <Button
                      variant={sortOrder === 'desc' ? 'primary' : 'outline-primary'}
                      className="flex-grow-1"
                      onClick={() => setSortOrder('desc')}
                    >
                      <FaSortAmountDown className="me-2" /> Cao đến thấp
                    </Button>
                  </div>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, maxPrice]);
                    setCapacity(0);
                    setSortOrder('asc');
                  }}
                >
                  <FaFilter className="me-2" /> Đặt lại bộ lọc
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải danh sách phòng...</p>
            </div>
          ) : filteredRoomTypes.length > 0 ? (
            <Row>
              {filteredRoomTypes.map(roomType => (
                <Col lg={4} md={6} className="mb-4" key={roomType.id}>
                  <Card className="shadow-sm h-100">
                    <div className="room-image" style={{ height: '200px', overflow: 'hidden' }}>
                      <Card.Img 
                        variant="top" 
                        src={roomType.image_url} 
                        alt={roomType.name}
                        style={{ height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = `https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg`;
                        }}
                      />
                    </div>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title>{roomType.name}</Card.Title>
                        <Badge bg="info">
                          <FaCat className="me-1" /> {roomType.capacity} mèo
                        </Badge>
                      </div>
                      <Card.Text className="text-muted small" style={{ minHeight: '60px' }}>
                        {roomType.description 
                          ? (roomType.description.length > 100 
                            ? roomType.description.substring(0, 100) + '...' 
                            : roomType.description)
                          : 'Không có mô tả.'}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="price">
                          <span className="fw-bold">{Number(roomType.price_per_day).toLocaleString()} VNĐ</span>
                          <small className="text-muted"> / ngày</small>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0">
                      <div className="d-grid">
                        <Link to={`/room-type/${roomType.id}`} className="btn btn-outline-primary">
                          Xem chi tiết
                        </Link>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="alert alert-info">
              Không tìm thấy phòng phù hợp với điều kiện lọc. Vui lòng thay đổi bộ lọc và thử lại.
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RoomsList;