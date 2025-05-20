import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaBed, FaUsers, FaCat, FaClipboardList } from 'react-icons/fa';
import adminService from '../../api/adminService';
import roomService from '../../api/roomService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import BookingStatusBadge from '../../components/admin/BookingStatusBadge';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCats: 0,
    totalRooms: 0,
    activeBookings: 0,
    roomStatus: {
      available: 0,
      occupied: 0,
      maintenance: 0
    }
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get users
        const usersResponse = await adminService.getUsers();
        
        // Get bookings
        const bookingsResponse = await adminService.getBookings();
        
        // Get rooms
        const roomsResponse = await roomService.getRooms();
        
        // Calculate stats
        const bookings = bookingsResponse.data;
        const users = usersResponse.data;
        const rooms = roomsResponse.data;
        
        // Count cats (unique cat_id from bookings)
        const uniqueCats = new Set();
        bookings.forEach(booking => uniqueCats.add(booking.cat_id));
        
        // Count active bookings
        const activeBookings = bookings.filter(
          booking => ['pending', 'confirmed', 'checked_in'].includes(booking.status)
        );
        
        // Count room statuses
        const roomStatus = {
          available: rooms.filter(room => room.status === 'available').length,
          occupied: rooms.filter(room => room.status === 'occupied').length,
          maintenance: rooms.filter(room => room.status === 'maintenance').length
        };
        
        // Set stats
        setStats({
          totalUsers: users.length,
          totalCats: uniqueCats.size,
          totalRooms: rooms.length,
          activeBookings: activeBookings.length,
          roomStatus
        });
        
        // Recent bookings (top 5)
        const sortedBookings = [...bookings]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        setRecentBookings(sortedBookings);
        
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Dashboard</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <AdminStatsCard 
                title="Tổng người dùng"
                value={stats.totalUsers}
                icon={<FaUsers size={24} />}
                color="primary"
                linkTo="/admin/users"
              />
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <AdminStatsCard 
                title="Đặt phòng hiện tại"
                value={stats.activeBookings}
                icon={<FaCalendarAlt size={24} />}
                color="success"
                linkTo="/admin/bookings"
              />
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <AdminStatsCard 
                title="Tổng phòng"
                value={stats.totalRooms}
                icon={<FaBed size={24} />}
                color="info"
                linkTo="/admin/rooms"
              />
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <AdminStatsCard 
                title="Tổng mèo"
                value={stats.totalCats}
                icon={<FaCat size={24} />}
                color="warning"
                linkTo="/admin/bookings"
              />
            </Col>
          </Row>

          <Row>
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                  <h5 className="mb-0">Đặt phòng gần đây</h5>
                  <Link to="/admin/bookings" className="btn btn-sm btn-primary">
                    Xem tất cả
                  </Link>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Người đặt</th>
                          <th>Mèo</th>
                          <th>Phòng</th>
                          <th>Check-in</th>
                          <th>Trạng thái</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.length > 0 ? (
                          recentBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id}</td>
                              <td>{booking.user_name}</td>
                              <td>{booking.cat_name}</td>
                              <td>{booking.room_number}</td>
                              <td>
                                {format(new Date(booking.check_in_date), 'dd/MM/yyyy', { locale: vi })}
                              </td>
                              <td>
                                <BookingStatusBadge status={booking.status} />
                              </td>
                              <td>
                                <Link to={`/admin/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary">
                                  Chi tiết
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-3">
                              Không có đặt phòng nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Tình trạng phòng</h5>
                </Card.Header>
                <Card.Body>
                  <div className="room-status-chart mb-4">
                    <div className="d-flex flex-column">
                      <div className="status-item d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className="status-color bg-success me-2" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <span>Còn trống</span>
                        </div>
                        <span className="fw-bold">{stats.roomStatus.available}</span>
                      </div>
                      <div className="status-item d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className="status-color bg-danger me-2" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <span>Đã đặt</span>
                        </div>
                        <span className="fw-bold">{stats.roomStatus.occupied}</span>
                      </div>
                      <div className="status-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="status-color bg-warning me-2" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <span>Bảo trì</span>
                        </div>
                        <span className="fw-bold">{stats.roomStatus.maintenance}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="room-status-bars mt-4">
                    <div className="progress" style={{ height: '30px' }}>
                      {stats.roomStatus.available > 0 && (
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${(stats.roomStatus.available / stats.totalRooms) * 100}%` }}
                        >
                          {stats.roomStatus.available}
                        </div>
                      )}
                      {stats.roomStatus.occupied > 0 && (
                        <div 
                          className="progress-bar bg-danger" 
                          style={{ width: `${(stats.roomStatus.occupied / stats.totalRooms) * 100}%` }}
                        >
                          {stats.roomStatus.occupied}
                        </div>
                      )}
                      {stats.roomStatus.maintenance > 0 && (
                        <div 
                          className="progress-bar bg-warning" 
                          style={{ width: `${(stats.roomStatus.maintenance / stats.totalRooms) * 100}%` }}
                        >
                          {stats.roomStatus.maintenance}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link to="/admin/rooms" className="btn btn-outline-primary">
                      Quản lý phòng
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Thống kê nhanh</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="border-end">
                      <div className="text-center p-3">
                        <FaClipboardList size={36} className="text-info mb-3" />
                        <h3 className="mb-1">
                          {recentBookings.filter(booking => booking.status === 'pending').length}
                        </h3>
                        <p className="text-muted mb-0">Đơn đặt phòng đang chờ xác nhận</p>
                      </div>
                    </Col>
                    <Col md={4} className="border-end">
                      <div className="text-center p-3">
                        <FaCalendarAlt size={36} className="text-success mb-3" />
                        <h3 className="mb-1">
                          {recentBookings.filter(booking => booking.status === 'checked_in').length}
                        </h3>
                        <p className="text-muted mb-0">Mèo đang lưu trú</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3">
                        <FaBed size={36} className="text-danger mb-3" />
                        <h3 className="mb-1">
                          {stats.roomStatus.available}
                        </h3>
                        <p className="text-muted mb-0">Phòng còn trống</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;