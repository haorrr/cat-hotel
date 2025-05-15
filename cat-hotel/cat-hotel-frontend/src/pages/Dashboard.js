import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import bookingService from '../api/bookingService';
import catService from '../api/catService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaCat, FaCalendarAlt, FaBed, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách đặt phòng
        const bookingsResponse = await bookingService.getBookings();
        setBookings(bookingsResponse.data);
        
        // Lấy danh sách mèo
        const catsResponse = await catService.getCats();
        setCats(catsResponse.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc đặt phòng theo trạng thái
  const activeBookings = bookings.filter(
    booking => ['pending', 'confirmed', 'checked_in'].includes(booking.status)
  );
  
  // Sắp xếp theo ngày tạo (mới nhất lên đầu)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Format trạng thái đặt phòng
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'checked_in': 'Đã nhận phòng',
      'checked_out': 'Đã trả phòng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Lấy class CSS cho badge trạng thái
  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'bg-warning',
      'confirmed': 'bg-info',
      'checked_in': 'bg-success',
      'checked_out': 'bg-secondary',
      'cancelled': 'bg-danger'
    };
    return classMap[status] || 'bg-primary';
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Xin chào, {currentUser.name}!</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white p-3 rounded-circle me-3">
                      <FaCat size={24} />
                    </div>
                    <div>
                      <h4 className="mb-0">{cats.length}</h4>
                      <p className="text-muted mb-0">Mèo của bạn</p>
                    </div>
                  </div>
                  <p>Quản lý thông tin mèo cưng của bạn</p>
                  <Link to="/cats" className="btn btn-outline-primary w-100">
                    Xem tất cả mèo
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success text-white p-3 rounded-circle me-3">
                      <FaCalendarAlt size={24} />
                    </div>
                    <div>
                      <h4 className="mb-0">{activeBookings.length}</h4>
                      <p className="text-muted mb-0">Đặt phòng hiện tại</p>
                    </div>
                  </div>
                  <p>Xem các đặt phòng đang chờ hoặc đang diễn ra</p>
                  <Link to="/bookings" className="btn btn-outline-success w-100">
                    Xem lịch sử đặt phòng
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={12} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info text-white p-3 rounded-circle me-3">
                      <FaBed size={24} />
                    </div>
                    <div>
                      <h4 className="mb-0">Đặt phòng</h4>
                      <p className="text-muted mb-0">Đặt phòng mới</p>
                    </div>
                  </div>
                  <p>Đặt phòng khách sạn cho mèo cưng của bạn</p>
                  <Link to="/book-room" className="btn btn-outline-info w-100">
                    Đặt phòng ngay
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Đặt phòng gần đây</h5>
                </Card.Header>
                <Card.Body>
                  {recentBookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Mã đặt phòng</th>
                            <th>Phòng</th>
                            <th>Mèo</th>
                            <th>Check-in</th>
                            <th>Trạng thái</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id}</td>
                              <td>{booking.room_number}</td>
                              <td>{booking.cat_name}</td>
                              <td>
                                {format(new Date(booking.check_in_date), 'dd/MM/yyyy', { locale: vi })}
                              </td>
                              <td>
                                <span className={`badge ${getStatusClass(booking.status)}`}>
                                  {formatStatus(booking.status)}
                                </span>
                              </td>
                              <td>
                                <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary">
                                  Chi tiết
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-3">
                      Bạn chưa có đặt phòng nào. <Link to="/book-room">Đặt phòng ngay</Link>
                    </p>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Link to="/bookings" className="btn btn-link text-decoration-none">
                    Xem tất cả đặt phòng
                  </Link>
                </Card.Footer>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Mèo của bạn</h5>
                </Card.Header>
                <Card.Body>
                  {cats.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {cats.slice(0, 5).map(cat => (
                        <li key={cat.id} className="list-group-item px-0 py-3 border-bottom">
                          <div className="d-flex align-items-center">
                            <div className="cat-avatar bg-light rounded-circle p-2 me-3">
                              <FaCat size={20} className="text-primary" />
                            </div>
                            <div>
                              <h6 className="mb-0">{cat.name}</h6>
                              <small className="text-muted">
                                {cat.breed || 'Không có giống'} &bull; {cat.gender === 'male' ? 'Đực' : cat.gender === 'female' ? 'Cái' : 'Không xác định'}
                              </small>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-3">
                      <p>Bạn chưa thêm mèo nào</p>
                      <Link to="/cats/add" className="btn btn-primary">
                        <FaPlus className="me-2" /> Thêm mèo
                      </Link>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Link to="/cats" className="btn btn-link text-decoration-none">
                      Xem tất cả mèo
                    </Link>
                    {cats.length > 0 && (
                      <Link to="/cats/add" className="btn btn-primary btn-sm">
                        <FaPlus className="me-1" /> Thêm mèo
                      </Link>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
