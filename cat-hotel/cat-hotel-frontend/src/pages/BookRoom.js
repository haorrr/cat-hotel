import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCat, FaCalendarAlt, FaArrowRight, FaCheck, FaBed } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import roomService from '../api/roomService';
import catService from '../api/catService';
import bookingService from '../api/bookingService';

// Schema validation
const bookingSchema = Yup.object().shape({
  check_in_date: Yup.date()
    .required('Ngày nhận phòng là bắt buộc')
    .min(new Date(), 'Ngày nhận phòng phải từ hôm nay trở đi'),
  check_out_date: Yup.date()
    .required('Ngày trả phòng là bắt buộc')
    .min(
      Yup.ref('check_in_date'),
      'Ngày trả phòng phải sau ngày nhận phòng'
    ),
  room_id: Yup.number()
    .required('Vui lòng chọn phòng'),
  cat_id: Yup.number()
    .required('Vui lòng chọn mèo của bạn'),
  special_requests: Yup.string()
});

const BookRoom = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [cats, setCats] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    check_in_date: addDays(new Date(), 1),
    check_out_date: addDays(new Date(), 3),
    room_id: '',
    cat_id: '',
    special_requests: ''
  });

  // Tải danh sách mèo
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await catService.getCats();
        setCats(response.data);
      } catch (err) {
        console.error('Error fetching cats:', err);
        setError('Không thể tải danh sách mèo. Vui lòng thử lại sau.');
      }
    };

    fetchCats();
  }, []);

  // Tải danh sách phòng
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getRooms();
        setRooms(response.data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Tìm phòng trống khi chọn ngày
  const searchAvailableRooms = async (checkInDate, checkOutDate) => {
    try {
      setLoading(true);
      
      const formatted_check_in = format(checkInDate, 'yyyy-MM-dd');
      const formatted_check_out = format(checkOutDate, 'yyyy-MM-dd');
      
      const response = await roomService.getAvailableRooms(
        formatted_check_in, 
        formatted_check_out
      );
      
      setAvailableRooms(response.data);
      setStep(2);
    } catch (err) {
      console.error('Error searching available rooms:', err);
      setError('Không thể tìm phòng trống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn ngày và tìm phòng
  const handleDateSubmit = (values) => {
    setBookingData({
      ...bookingData,
      check_in_date: values.check_in_date,
      check_out_date: values.check_out_date
    });
    
    searchAvailableRooms(values.check_in_date, values.check_out_date);
  };

  // Xử lý chọn phòng
  const handleRoomSelect = (roomId) => {
    setBookingData({
      ...bookingData,
      room_id: roomId
    });
    
    setStep(3);
  };

  // Xử lý hoàn tất đặt phòng
  const handleBookingSubmit = async (values) => {
    try {
      setLoading(true);
      
      const bookingRequest = {
        check_in_date: format(values.check_in_date, 'yyyy-MM-dd'),
        check_out_date: format(values.check_out_date, 'yyyy-MM-dd'),
        room_id: values.room_id,
        cat_id: values.cat_id,
        special_requests: values.special_requests
      };
      
      await bookingService.createBooking(bookingRequest);
      
      // Chuyển đến trang đặt phòng thành công
      navigate('/booking-success');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Không thể đặt phòng. Vui lòng thử lại sau.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Tính số ngày đặt phòng
  const calculateDays = (checkIn, checkOut) => {
    return differenceInDays(checkOut, checkIn);
  };

  // Tìm thông tin phòng theo ID
  const findRoomById = (roomId) => {
    return availableRooms.find(room => room.id === roomId) || null;
  };

  // Hiển thị các bước đặt phòng
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Chọn ngày đặt phòng</h4>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={{
                  check_in_date: bookingData.check_in_date,
                  check_out_date: bookingData.check_out_date
                }}
                validationSchema={Yup.object({
                  check_in_date: Yup.date()
                    .required('Ngày nhận phòng là bắt buộc')
                    .min(new Date(), 'Ngày nhận phòng phải từ hôm nay trở đi'),
                  check_out_date: Yup.date()
                    .required('Ngày trả phòng là bắt buộc')
                    .min(
                      Yup.ref('check_in_date'),
                      'Ngày trả phòng phải sau ngày nhận phòng'
                    )
                })}
                onSubmit={handleDateSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày nhận phòng</Form.Label>
                          <div>
                            <DatePicker
                              selected={values.check_in_date}
                              onChange={date => {
                                setFieldValue('check_in_date', date);
                                // Tự động cập nhật ngày trả phòng (thêm 2 ngày)
                                if (calculateDays(date, values.check_out_date) < 1) {
                                  setFieldValue('check_out_date', addDays(date, 2));
                                }
                              }}
                              minDate={new Date()}
                              dateFormat="dd/MM/yyyy"
                              className={`form-control ${touched.check_in_date && errors.check_in_date ? 'is-invalid' : ''}`}
                            />
                            {touched.check_in_date && errors.check_in_date && (
                              <div className="invalid-feedback">{errors.check_in_date}</div>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngày trả phòng</Form.Label>
                          <div>
                            <DatePicker
                              selected={values.check_out_date}
                              onChange={date => setFieldValue('check_out_date', date)}
                              minDate={addDays(values.check_in_date, 1)}
                              dateFormat="dd/MM/yyyy"
                              className={`form-control ${touched.check_out_date && errors.check_out_date ? 'is-invalid' : ''}`}
                            />
                            {touched.check_out_date && errors.check_out_date && (
                              <div className="invalid-feedback">{errors.check_out_date}</div>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted mb-1">Tổng thời gian:</div>
                        <h5 className="mb-0">{calculateDays(values.check_in_date, values.check_out_date)} ngày</h5>
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isSubmitting || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            Tìm phòng trống <FaArrowRight className="ms-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        );
      
      case 2:
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Chọn phòng</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <p className="mb-1">Thời gian đặt phòng:</p>
                <h5>
                  {format(bookingData.check_in_date, 'dd/MM/yyyy', { locale: vi })}
                  <FaArrowRight className="mx-2" />
                  {format(bookingData.check_out_date, 'dd/MM/yyyy', { locale: vi })}
                  <span className="ms-2 text-muted">
                    ({calculateDays(bookingData.check_in_date, bookingData.check_out_date)} ngày)
                  </span>
                </h5>
                <Button 
                  variant="link" 
                  className="p-0 text-decoration-none" 
                  onClick={() => setStep(1)}
                >
                  Thay đổi ngày
                </Button>
              </div>

              {availableRooms.length > 0 ? (
                <Row>
                  {availableRooms.map(room => (
                    <Col lg={4} md={6} className="mb-4" key={room.id}>
                      <Card 
                        className={`h-100 border ${bookingData.room_id === room.id ? 'border-primary' : ''}`}
                        onClick={() => handleRoomSelect(room.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Img 
                          variant="top" 
                          src={room.image_url} 
                          alt={room.room_type_name}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/300x200?text=${room.room_type_name}`;
                          }}
                        />
                        <Card.Body>
                          <h5>{room.room_type_name} - {room.room_number}</h5>
                          <p className="text-muted small">{room.description}</p>
                          
                          <div className="mb-3">
                            <span className="badge bg-light text-dark me-2">Sức chứa: {room.capacity} mèo</span>
                            <span className="badge bg-light text-dark">Trạng thái: Còn trống</span>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="price">
                              <span className="h5 text-primary">{Number(room.price_per_day).toLocaleString()} VNĐ</span>
                              <small className="text-muted"> / ngày</small>
                            </div>
                            <div className="total text-end">
                              <small className="d-block text-muted">Tổng tiền ({calculateDays(bookingData.check_in_date, bookingData.check_out_date)} ngày):</small>
                              <span className="text-success fw-bold">
                                {(room.price_per_day * calculateDays(bookingData.check_in_date, bookingData.check_out_date)).toLocaleString()} VNĐ
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-white text-center">
                          {bookingData.room_id === room.id ? (
                            <Button variant="primary" className="w-100">
                              <FaCheck className="me-2" /> Đã chọn
                            </Button>
                          ) : (
                            <Button variant="outline-primary" className="w-100">
                              Chọn phòng này
                            </Button>
                          )}
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="warning">
                  Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.
                </Alert>
              )}
              
              {bookingData.room_id && (
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setStep(1)}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setStep(3)}
                  >
                    Tiếp tục <FaArrowRight className="ms-2" />
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        );
      
      case 3:
        const selectedRoom = findRoomById(bookingData.room_id);
        
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Hoàn tất đặt phòng</h4>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={{
                  ...bookingData
                }}
                validationSchema={bookingSchema}
                onSubmit={handleBookingSubmit}
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
                    <Row>
                      <Col md={7}>
                        <h5 className="mb-4">Thông tin đặt phòng</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Chọn mèo</Form.Label>
                          <Form.Select
                            name="cat_id"
                            value={values.cat_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.cat_id && errors.cat_id}
                          >
                            <option value="">-- Chọn mèo --</option>
                            {cats.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} - {cat.breed || 'Không có giống'} 
                                {cat.weight ? ` (${cat.weight} kg)` : ''}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.cat_id}
                          </Form.Control.Feedback>
                          {cats.length === 0 && (
                            <div className="mt-2 text-danger">
                              Bạn chưa có mèo nào. <a href="/cats">Thêm mèo tại đây</a>.
                            </div>
                          )}
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Yêu cầu đặc biệt (nếu có)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="special_requests"
                            value={values.special_requests}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={5}>
                        <Card className="bg-light border-0">
                          <Card.Body>
                            <h5 className="mb-4">Tóm tắt đặt phòng</h5>
                            
                            {selectedRoom && (
                              <>
                                <div className="summary-item mb-3 pb-3 border-bottom">
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="text-muted">Phòng:</div>
                                    <div className="fw-bold">{selectedRoom.room_type_name} - {selectedRoom.room_number}</div>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <div className="text-muted">Giá phòng:</div>
                                    <div>{Number(selectedRoom.price_per_day).toLocaleString()} VNĐ / ngày</div>
                                  </div>
                                </div>
                                
                                <div className="summary-item mb-3 pb-3 border-bottom">
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="text-muted">Ngày nhận phòng:</div>
                                    <div>{format(values.check_in_date, 'dd/MM/yyyy', { locale: vi })}</div>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="text-muted">Ngày trả phòng:</div>
                                    <div>{format(values.check_out_date, 'dd/MM/yyyy', { locale: vi })}</div>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <div className="text-muted">Tổng thời gian:</div>
                                    <div>{calculateDays(values.check_in_date, values.check_out_date)} ngày</div>
                                  </div>
                                </div>
                                
                                <div className="summary-item mb-3">
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="text-muted">Phí phòng:</div>
                                    <div>
                                      {(selectedRoom.price_per_day * calculateDays(values.check_in_date, values.check_out_date)).toLocaleString()} VNĐ
                                    </div>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <div className="text-muted">Phí dịch vụ:</div>
                                    <div>0 VNĐ</div>
                                  </div>
                                </div>
                                
                                <div className="summary-total mt-4">
                                  <div className="d-flex justify-content-between">
                                    <div className="fw-bold">Tổng tiền:</div>
                                    <div className="h5 mb-0 text-primary">
                                      {(selectedRoom.price_per_day * calculateDays(values.check_in_date, values.check_out_date)).toLocaleString()} VNĐ
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setStep(2)}
                      >
                        Quay lại
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isSubmitting || loading || cats.length === 0}
                      >
                        {loading || isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Đang xử lý...
                          </>
                        ) : (
                          'Hoàn tất đặt phòng'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        );
      
      default:
        return null;
    }
  };

  // Hiển thị tiến trình đặt phòng
  const renderStepIndicator = () => {
    return (
      <div className="booking-steps mb-4">
        <Row>
          <Col xs={4} className="text-center">
            <div 
              className={`step-circle mx-auto mb-2 ${step >= 1 ? 'active' : ''}`}
              onClick={() => step > 1 && setStep(1)}
              style={{ cursor: step > 1 ? 'pointer' : 'default' }}
            >
              <FaCalendarAlt />
            </div>
            <div className="step-title">Chọn ngày</div>
          </Col>
          <Col xs={4} className="text-center">
            <div 
              className={`step-circle mx-auto mb-2 ${step >= 2 ? 'active' : ''}`}
              onClick={() => step > 2 && setStep(2)}
              style={{ cursor: step > 2 ? 'pointer' : 'default' }}
            >
              <FaBed />
            </div>
            <div className="step-title">Chọn phòng</div>
          </Col>
          <Col xs={4} className="text-center">
            <div className={`step-circle mx-auto mb-2 ${step >= 3 ? 'active' : ''}`}>
              <FaCat />
            </div>
            <div className="step-title">Hoàn tất</div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <h2 className="mb-1">Đặt phòng</h2>
      <p className="text-muted mb-4">Thực hiện đặt phòng cho mèo cưng của bạn</p>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="booking-container">
        {renderStepIndicator()}
        {renderStep()}
      </div>
      
      <style jsx="true">{`
        .booking-steps .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        
        .booking-steps .step-circle.active {
          background-color: #0d6efd;
          color: white;
        }
        
        .booking-steps .step-title {
          font-size: 0.9rem;
          font-weight: 500;
        }
      `}</style>
    </Container>
  );
};

export default BookRoom;
