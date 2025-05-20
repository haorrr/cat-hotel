import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaCat, FaPrint, FaUser, FaCalendarAlt, FaBed, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import adminService from '../../api/adminService';
import bookingService from '../../api/bookingService';
import BookingStatusBadge from '../../components/admin/BookingStatusBadge';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Schema validation for cat status form
const catStatusSchema = Yup.object().shape({
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['checked_in', 'in_care', 'resting', 'playing', 'eating', 'checked_out'], 'Trạng thái không hợp lệ'),
  notes: Yup.string()
});

// Schema validation for booking status form
const bookingStatusSchema = Yup.object().shape({
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], 'Trạng thái không hợp lệ')
});

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [catStatuses, setCatStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCatStatusModal, setShowCatStatusModal] = useState(false);

  // Fetch booking details
  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      setBooking(response.data.booking);
      setCatStatuses(response.data.catStatuses || []);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  // Show success message and clear after a delay
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Map status to text
  const getStatusText = (status) => {
    const statusMap = {
      'checked_in': 'Đã nhận phòng',
      'in_care': 'Đang được chăm sóc',
      'resting': 'Đang nghỉ ngơi',
      'playing': 'Đang chơi',
      'eating': 'Đang ăn',
      'checked_out': 'Đã trả phòng'
    };
    return statusMap[status] || status;
  };

  // Handle update booking status
  const handleUpdateStatus = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      await adminService.updateBookingStatus(id, values.status);
      
      showSuccess('Cập nhật trạng thái đơn đặt phòng thành công!');
      setShowStatusModal(false);
      
      // Refresh booking details
      fetchBookingDetails();
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn đặt phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update cat status
  const handleUpdateCatStatus = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      await adminService.updateCatStatus(id, values.status, values.notes);
      
      showSuccess('Cập nhật trạng thái mèo thành công!');
      setShowCatStatusModal(false);
      
      // Refresh booking details
      fetchBookingDetails();
      
    } catch (error) {
      console.error('Error updating cat status:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật trạng thái mèo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Print booking details
  const handlePrint = () => {
    window.print();
  };

  // Calculate number of days
  const calculateDays = (checkIn, checkOut) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={() => navigate('/admin/bookings')}
          >
            <FaArrowLeft /> Quay lại
          </Button>
          <div>
            <h2 className="mb-1">Chi tiết đặt phòng {booking && `#${booking.id}`}</h2>
            <p className="text-muted mb-0">Xem và quản lý thông tin đặt phòng</p>
          </div>
        </div>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={handlePrint}
          >
            <FaPrint className="me-2" /> In
          </Button>
          {booking && booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
            <Button 
              variant="primary"
              onClick={() => setShowStatusModal(true)}
            >
              <FaEdit className="me-2" /> Cập nhật trạng thái
            </Button>
          )}
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
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thông tin đặt phòng...</p>
        </div>
      ) : booking ? (
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Thông tin đặt phòng</h5>
                <BookingStatusBadge status={booking.status} />
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaUser className="me-2" /> Khách hàng
                      </div>
                      <div className="info-value">
                        <h6>{booking.user_name}</h6>
                        <p className="mb-0">{booking.user_email}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaCat className="me-2" /> Thông tin mèo
                      </div>
                      <div className="info-value">
                        <h6>{booking.cat_name}</h6>
                        <p className="mb-0">{booking.cat_breed || 'Không có giống'}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <hr />
                
                <Row>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaBed className="me-2" /> Thông tin phòng
                      </div>
                      <div className="info-value">
                        <h6>{booking.room_type} - {booking.room_number}</h6>
                        <p className="mb-0">Giá: {Number(booking.price_per_day).toLocaleString()} VNĐ/ngày</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaCalendarAlt className="me-2" /> Thời gian đặt phòng
                      </div>
                      <div className="info-value">
                        <div className="d-flex align-items-center mb-1">
                          <Badge bg="light" text="dark" className="me-2">Nhận phòng</Badge>
                          <span>{format(new Date(booking.check_in_date), 'dd/MM/yyyy', { locale: vi })}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Badge bg="light" text="dark" className="me-2">Trả phòng</Badge>
                          <span>{format(new Date(booking.check_out_date), 'dd/MM/yyyy', { locale: vi })}</span>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">
                            Tổng thời gian: {calculateDays(booking.check_in_date, booking.check_out_date)} ngày
                          </small>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <hr />
                
                <Row>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaMoneyBillWave className="me-2" /> Thông tin thanh toán
                      </div>
                      <div className="info-value">
                        <h5 className="text-primary">{Number(booking.total_price).toLocaleString()} VNĐ</h5>
                        <small className="text-muted">
                          {Number(booking.price_per_day).toLocaleString()} VNĐ x {calculateDays(booking.check_in_date, booking.check_out_date)} ngày
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-4">
                    <div className="info-group">
                      <div className="info-label text-muted">
                        <FaClipboardList className="me-2" /> Yêu cầu đặc biệt
                      </div>
                      <div className="info-value">
                        {booking.special_requests ? (
                          <p className="mb-0">{booking.special_requests}</p>
                        ) : (
                          <p className="text-muted mb-0">Không có yêu cầu đặc biệt</p>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Lịch sử trạng thái mèo</h5>
                {booking.status === 'checked_in' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowCatStatusModal(true)}
                  >
                    <FaEdit className="me-2" /> Cập nhật trạng thái mèo
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {catStatuses.length > 0 ? (
                  <div className="cat-status-timeline">
                    {catStatuses.map((status, index) => (
                      <div 
                        key={status.id} 
                        className={`timeline-item ${index === 0 ? 'active' : ''}`}
                      >
                        <div className="timeline-badge">
                          <FaCat />
                        </div>
                        <div className="timeline-content">
                          <div className="d-flex justify-content-between">
                            <h6>{getStatusText(status.status)}</h6>
                            <small className="text-muted">
                              {format(new Date(status.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </small>
                          </div>
                          {status.notes && (
                            <p className="mb-0">{status.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">Chưa có thông tin trạng thái mèo</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Quản lý đặt phòng</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h6 className="mb-2">Trạng thái hiện tại</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <BookingStatusBadge status={booking.status} size="lg" />
                    <small className="text-muted">
                      Cập nhật: {format(new Date(booking.updated_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </small>
                  </div>
                </div>
                
                {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                  <div className="d-grid gap-2">
                    {booking.status === 'pending' && (
                      <Button 
                        variant="success"
                        onClick={() => {
                          setShowStatusModal(true);
                        }}
                      >
                        Xác nhận đơn đặt phòng
                      </Button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="success"
                        onClick={() => {
                          setShowStatusModal(true);
                        }}
                      >
                        Check-in
                      </Button>
                    )}
                    
                    {booking.status === 'checked_in' && (
                      <Button 
                        variant="primary"
                        onClick={() => {
                          setShowStatusModal(true);
                        }}
                      >
                        Check-out
                      </Button>
                    )}
                    
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button 
                        variant="danger"
                        onClick={() => {
                          setShowStatusModal(true);
                        }}
                      >
                        Hủy đơn đặt phòng
                      </Button>
                    )}
                  </div>
                )}
                
                {(booking.status === 'cancelled' || booking.status === 'checked_out') && (
                  <div className="alert alert-info mb-0">
                    <small>
                      Đơn đặt phòng này đã hoàn thành hoặc đã bị hủy. Không thể cập nhật trạng thái.
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="booking-info">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Mã đơn hàng:</span>
                    <span className="fw-bold">#{booking.id}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Ngày đặt:</span>
                    <span>{format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Số ngày:</span>
                    <span>{calculateDays(booking.check_in_date, booking.check_out_date)} ngày</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Giá phòng:</span>
                    <span>{Number(booking.price_per_day).toLocaleString()} VNĐ/ngày</span>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Tổng tiền:</span>
                    <span className="fw-bold text-primary">{Number(booking.total_price).toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Alert variant="warning">
          Không tìm thấy thông tin đặt phòng.
        </Alert>
      )}
      
      {/* Booking Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đặt phòng</Modal.Title>
        </Modal.Header>
        {booking && (
          <Formik
            initialValues={{
              status: booking.status
            }}
            validationSchema={bookingStatusSchema}
            onSubmit={handleUpdateStatus}
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
                  <div className="mb-3">
                    <h6>Thông tin đặt phòng:</h6>
                    <p className="mb-1">
                      <strong>ID:</strong> #{booking.id}
                    </p>
                    <p className="mb-1">
                      <strong>Khách hàng:</strong> {booking.user_name}
                    </p>
                    <p className="mb-1">
                      <strong>Mèo:</strong> {booking.cat_name}
                    </p>
                    <p className="mb-1">
                      <strong>Phòng:</strong> {booking.room_number}
                    </p>
                    <p className="mb-0">
                      <strong>Trạng thái hiện tại:</strong> <BookingStatusBadge status={booking.status} />
                    </p>
                  </div>
                  
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
        )}
      </Modal>
      
      {/* Cat Status Modal */}
      <Modal show={showCatStatusModal} onHide={() => setShowCatStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái mèo</Modal.Title>
        </Modal.Header>
        {booking && (
          <Formik
            initialValues={{
              status: 'in_care',
              notes: ''
            }}
            validationSchema={catStatusSchema}
            onSubmit={handleUpdateCatStatus}
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
                  <div className="mb-3">
                    <h6>Thông tin mèo:</h6>
                    <p className="mb-1">
                      <strong>Tên mèo:</strong> {booking.cat_name}
                    </p>
                    <p className="mb-0">
                      <strong>Giống:</strong> {booking.cat_breed || 'Không có giống'}
                    </p>
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Trạng thái mèo</Form.Label>
                    <Form.Select
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.status && errors.status}
                    >
                      <option value="in_care">Đang được chăm sóc</option>
                      <option value="resting">Đang nghỉ ngơi</option>
                      <option value="playing">Đang chơi</option>
                      <option value="eating">Đang ăn</option>
                      <option value="checked_out">Đã trả phòng</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.status}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group>
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nhập ghi chú về tình trạng mèo (nếu có)"
                    />
                    <Form.Text className="text-muted">
                      Ghi chú sẽ được hiển thị trong lịch sử trạng thái mèo.
                    </Form.Text>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowCatStatusModal(false)}>
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
        )}
      </Modal>
      
      {/* Custom CSS for timeline */}
      <style jsx="true">{`
        .timeline-item {
          position: relative;
          padding-left: 45px;
          padding-bottom: 20px;
          border-left: 2px solid #e9ecef;
        }
        
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        
        .timeline-badge {
          position: absolute;
          left: -15px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        
        .timeline-item.active .timeline-badge {
          background-color: #0d6efd;
          color: white;
        }
        
        .timeline-content {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
        }
        
        .timeline-item.active .timeline-content {
          border-left: 3px solid #0d6efd;
        }
        
        .info-label {
          font-size: 0.9rem;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        
        @media print {
          .btn, 
          button,
          .booking-actions {
            display: none;
          }
        }
      `}</style>
    </Container>
  );
};

export default BookingDetail;