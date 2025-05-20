import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { FaEdit, FaEye, FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import adminService from '../../api/adminService';
import BookingStatusBadge from '../../components/admin/BookingStatusBadge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Schema validation for booking status form
const bookingStatusSchema = Yup.object().shape({
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], 'Trạng thái không hợp lệ')
});

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const statusList = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'checked_in', label: 'Đã nhận phòng' },
    { key: 'checked_out', label: 'Đã trả phòng' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBookings();
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Không thể tải dữ liệu đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Show success message and clear after a delay
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Filter bookings when tab changes or search term changes
  useEffect(() => {
    let result = [...bookings];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      result = result.filter(booking => booking.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => 
        booking.user_name?.toLowerCase().includes(term) ||
        booking.user_email?.toLowerCase().includes(term) ||
        booking.cat_name?.toLowerCase().includes(term) ||
        booking.room_number?.toLowerCase().includes(term) ||
        String(booking.id).includes(term)
      );
    }
    
    setFilteredBookings(result);
  }, [activeTab, searchTerm, bookings]);

  // Handle booking status update
  const handleStatusUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      await adminService.updateBookingStatus(selectedBooking.id, values.status);
      
      showSuccess('Cập nhật trạng thái đơn đặt phòng thành công!');
      setShowStatusModal(false);
      
      // Refresh bookings list
      fetchBookings();
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn đặt phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open status modal
  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý đặt phòng</h2>
          <p className="text-muted">Quản lý tất cả các đơn đặt phòng</p>
        </div>
      </div>
      
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="booking-filter d-flex justify-content-between align-items-center mb-4">
            <div className="search-box" style={{ width: '300px' }}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm đơn đặt phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>
            
            <div className="booking-actions">
              <Button 
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
              >
                <FaFilter className="me-1" /> Xóa bộ lọc
              </Button>
            </div>
          </div>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            {statusList.map(status => (
              <Tab 
                key={status.key} 
                eventKey={status.key} 
                title={
                  <div className="d-flex align-items-center">
                    <span>{status.label}</span>
                    {status.key !== 'all' && (
                      <Badge 
                        bg="light" 
                        text="dark" 
                        className="ms-2"
                      >
                        {bookings.filter(b => b.status === status.key).length}
                      </Badge>
                    )}
                  </div>
                }
              />
            ))}
          </Tabs>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu đặt phòng...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người đặt</th>
                    <th>Mèo</th>
                    <th>Phòng</th>
                    <th>Nhận phòng</th>
                    <th>Trả phòng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>
                          <div>{booking.user_name}</div>
                          <small className="text-muted">{booking.user_email}</small>
                        </td>
                        <td>{booking.cat_name}</td>
                        <td>{booking.room_number}</td>
                        <td>
                          {format(new Date(booking.check_in_date), 'dd/MM/yyyy', { locale: vi })}
                        </td>
                        <td>
                          {format(new Date(booking.check_out_date), 'dd/MM/yyyy', { locale: vi })}
                        </td>
                        <td>{Number(booking.total_price).toLocaleString()} VNĐ</td>
                        <td>
                          <BookingStatusBadge status={booking.status} />
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-2"
                            onClick={() => openStatusModal(booking)}
                          >
                            <FaEdit className="me-1" /> Đổi trạng thái
                          </Button>
                          <Link 
                            to={`/admin/bookings/${booking.id}`} 
                            className="btn btn-sm btn-outline-info"
                          >
                            <FaEye className="me-1" /> Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-3">
                        Không tìm thấy đơn đặt phòng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Booking Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đặt phòng</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            status: selectedBooking?.status || 'pending'
          }}
          validationSchema={bookingStatusSchema}
          onSubmit={handleStatusUpdate}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {selectedBooking && (
                  <div className="mb-3">
                    <h6>Thông tin đặt phòng:</h6>
                    <p className="mb-1">
                      <strong>ID:</strong> #{selectedBooking.id}
                    </p>
                    <p className="mb-1">
                      <strong>Khách hàng:</strong> {selectedBooking.user_name}
                    </p>
                    <p className="mb-1">
                      <strong>Mèo:</strong> {selectedBooking.cat_name}
                    </p>
                    <p className="mb-1">
                      <strong>Phòng:</strong> {selectedBooking.room_number}
                    </p>
                    <p className="mb-1">
                      <strong>Trạng thái hiện tại:</strong> <BookingStatusBadge status={selectedBooking.status} />
                    </p>
                  </div>
                )}
                
                <Form.Group>
                  <Form.Label>Trạng thái mới</Form.Label>
                  <Form.Select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.status && errors.status}
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="checked_in">Đã nhận phòng</option>
                    <option value="checked_out">Đã trả phòng</option>
                    <option value="cancelled">Đã hủy</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted mt-2">
                    <div className="alert alert-info p-2 mb-0 mt-2">
                      <small>
                        <strong>Lưu ý:</strong> Khi chuyển sang trạng thái "Đã nhận phòng", phòng sẽ được đánh dấu là "Đã đặt".
                        Khi chuyển sang trạng thái "Đã trả phòng", phòng sẽ được đánh dấu là "Bảo trì".
                      </small>
                    </div>
                  </Form.Text>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default BookingManagement;