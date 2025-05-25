import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCat, FaCalendarAlt, FaArrowRight, FaCheck, FaBed, FaShower, FaClipboard, 
         FaUtensils, FaPaw, FaMoneyBillWave, FaBoxOpen, FaClock, FaSpa, FaMagic } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import roomService from '../api/roomService';
import catService from '../api/catService';
import bookingService from '../api/bookingService';
import serviceService from '../api/serviceService';
import foodService from '../api/foodService';

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
  room_type_id: Yup.number()
    .required('Vui lòng chọn loại phòng'),
  room_id: Yup.number()
    .required('Vui lòng chọn phòng'),
  cat_id: Yup.number()
    .required('Vui lòng chọn mèo của bạn'),
  special_requests: Yup.string(),
  selected_services: Yup.array(),
  selected_foods: Yup.array()
});

const BookRoom = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [cats, setCats] = useState([]);
  const [services, setServices] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    check_in_date: addDays(new Date(), 1),
    check_out_date: addDays(new Date(), 3),
    room_type_id: '',
    room_id: '',
    cat_id: '',
    special_requests: '',
    selected_services: [],
    selected_foods: []
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch room types
        const roomTypesResponse = await roomService.getRoomTypes();
        setRoomTypes(roomTypesResponse.data);
        
        // Fetch cats
        const catsResponse = await catService.getCats();
        setCats(catsResponse.data);
        
        // Fetch services
        const servicesResponse = await serviceService.getServices();
        setServices(servicesResponse.data);
        
        // Fetch foods
        const foodsResponse = await foodService.getFoods();
        setFoods(foodsResponse.data);
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Không thể tải dữ liệu cần thiết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch available rooms
  const searchAvailableRooms = async (checkInDate, checkOutDate, roomTypeId) => {
    try {
      setLoading(true);
      
      const formatted_check_in = format(checkInDate, 'yyyy-MM-dd');
      const formatted_check_out = format(checkOutDate, 'yyyy-MM-dd');
      
      const response = await roomService.getAvailableRooms(
        formatted_check_in, 
        formatted_check_out
      );
      
      // Filter rooms by room type if specified
      const filteredRooms = roomTypeId 
        ? response.data.filter(room => room.room_type_id === parseInt(roomTypeId))
        : response.data;
      
      setAvailableRooms(filteredRooms);
      setStep(2);
    } catch (err) {
      console.error('Error searching available rooms:', err);
      setError('Không thể tìm phòng trống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotalPrice = (values) => {
    const selectedRoomType = roomTypes.find(rt => rt.id === parseInt(values.room_type_id));
    if (!selectedRoomType) return 0;
    
    const days = differenceInDays(values.check_out_date, values.check_in_date);
    
    // Base price (room price * days)
    let total = selectedRoomType.price_per_day * days;
    
    // Add service prices
    const selectedServices = services.filter(s => values.selected_services.includes(s.id));
    selectedServices.forEach(service => {
      total += service.price * days;
    });
    
    // Add food prices
    const selectedFoods = foods.filter(f => values.selected_foods.includes(f.id));
    selectedFoods.forEach(food => {
      total += food.price * days;
    });
    
    return total;
  };

  // Handle form submission
  const handleBookingSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Format dates
      const formattedCheckIn = format(values.check_in_date, 'yyyy-MM-dd');
      const formattedCheckOut = format(values.check_out_date, 'yyyy-MM-dd');
      
      // Calculate total price
      const totalPrice = calculateTotalPrice(values);
      
      // Create booking request
      const bookingRequest = {
        check_in_date: formattedCheckIn,
        check_out_date: formattedCheckOut,
        room_id: values.room_id,
        cat_id: values.cat_id,
        special_requests: values.special_requests,
        total_price: totalPrice,
        selected_services: values.selected_services,
        selected_foods: values.selected_foods
      };
      
      // Create booking
      const response = await bookingService.createBooking(bookingRequest);
      
      // Navigate to success page
      navigate('/booking-success');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Không thể đặt phòng. Vui lòng thử lại sau.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
  const name = serviceName.toLowerCase();
  if (name.includes('tắm') || name.includes('spa')) {
    return <FaShower className="text-info" size={28} />;
  } else if (name.includes('cắt') || name.includes('tỉa')) {
    return <FaMagic className="text-warning" size={28} />; // FaMagic cho dịch vụ làm đẹp
  } else if (name.includes('khám') || name.includes('y tế')) {
    return <FaClipboard className="text-danger" size={28} />;
  } else {
    return <FaSpa className="text-success" size={28} />;
  }
};

  // Render Step 1: Select dates and room type
  const renderStep1 = (formikProps) => {
    const { values, errors, touched, setFieldValue } = formikProps;
    
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Chọn thời gian và loại phòng</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4">
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaCalendarAlt className="me-2 text-primary" />
                  Ngày nhận phòng
                </Form.Label>
                <DatePicker
                  selected={values.check_in_date}
                  onChange={date => {
                    setFieldValue('check_in_date', date);
                    if (differenceInDays(values.check_out_date, date) < 1) {
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
              </Form.Group>
            </Col>
            
            <Col md={6} className="mb-4">
              <Form.Group>
                <Form.Label className="fw-bold">
                  <FaCalendarAlt className="me-2 text-danger" />
                  Ngày trả phòng
                </Form.Label>
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
              </Form.Group>
            </Col>
          </Row>
          
          <div className="mb-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Thời gian lưu trú:</h6>
                  <div className="badge bg-primary fs-6">
                    {differenceInDays(values.check_out_date, values.check_in_date)} ngày
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-muted">Từ: {format(values.check_in_date, 'dd/MM/yyyy', { locale: vi })}</div>
                  <div className="text-muted">Đến: {format(values.check_out_date, 'dd/MM/yyyy', { locale: vi })}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <FaBed className="me-2 text-primary" />
              Chọn loại phòng
            </Form.Label>
            <Row className="gy-3">
              {roomTypes.map(roomType => (
                <Col lg={4} md={6} key={roomType.id}>
                  <Card
                    className={`h-100 room-type-card border ${values.room_type_id === roomType.id.toString() ? 'border-primary' : ''}`}
                    onClick={() => setFieldValue('room_type_id', roomType.id.toString())}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ height: '140px', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={roomType.image_url}
                        alt={roomType.name}
                        style={{ height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = "https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg";
                        }}
                      />
                    </div>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h6 mb-0">{roomType.name}</Card.Title>
                        <Badge bg="info">
                          <FaCat className="me-1" /> {roomType.capacity}
                        </Badge>
                      </div>
                      <Card.Text className="small text-muted mb-2" style={{ minHeight: '40px' }}>
                        {roomType.description}
                      </Card.Text>
                      <div className="fw-bold text-primary">
                        {Number(roomType.price_per_day).toLocaleString()} VNĐ
                        <span className="fw-normal text-muted"> / ngày</span>
                      </div>
                    </Card.Body>
                    {values.room_type_id === roomType.id.toString() && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="primary" className="rounded-circle p-2">
                          <FaCheck />
                        </Badge>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
            {touched.room_type_id && errors.room_type_id && (
              <div className="text-danger mt-2">{errors.room_type_id}</div>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-between mt-4">
            <div></div>
            <Button
              variant="primary"
              onClick={() => {
                if (!values.room_type_id) {
                  setFieldValue('touched.room_type_id', true);
                  return;
                }
                searchAvailableRooms(
                  values.check_in_date,
                  values.check_out_date,
                  values.room_type_id
                );
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Đang tìm...
                </>
              ) : (
                <>
                  Tiếp tục <FaArrowRight className="ms-2" />
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render Step 2: Select room
  const renderStep2 = (formikProps) => {
    const { values, errors, touched, setFieldValue } = formikProps;
    const selectedRoomType = roomTypes.find(rt => rt.id === parseInt(values.room_type_id));
    
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Chọn phòng</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <div className="p-3 bg-light rounded-3 border">
              <Row className="align-items-center">
                <Col md={8}>
                  <h6 className="mb-0">Thông tin đã chọn:</h6>
                  <div className="mt-2">
                    <div className="d-flex align-items-center mb-1">
                      <FaBed className="text-primary me-2" />
                      <span>Loại phòng: <strong>{selectedRoomType?.name}</strong></span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <FaCalendarAlt className="text-primary me-2" />
                      <span>Thời gian: <strong>{format(values.check_in_date, 'dd/MM/yyyy', { locale: vi })} đến {format(values.check_out_date, 'dd/MM/yyyy', { locale: vi })}</strong></span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-primary me-2" />
                      <span>Số ngày: <strong>{differenceInDays(values.check_out_date, values.check_in_date)} ngày</strong></span>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Thay đổi
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <FaBed className="me-2 text-primary" />
              Chọn phòng trống
            </Form.Label>
            
            {availableRooms.length > 0 ? (
              <Row className="gy-3">
                {availableRooms.map(room => (
                  <Col md={6} key={room.id}>
                    <Card
                      className={`room-card border ${values.room_id === room.id.toString() ? 'border-primary' : ''}`}
                      onClick={() => setFieldValue('room_id', room.id.toString())}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">Phòng {room.room_number}</h5>
                          <Badge bg="success">Còn trống</Badge>
                        </div>
                        <div className="text-muted mb-3 small">{room.room_type_name}</div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <FaPaw className="text-muted me-2" />
                              <span>Sức chứa: {room.capacity} mèo</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaMoneyBillWave className="text-muted me-2" />
                              <span>{Number(room.price_per_day).toLocaleString()} VNĐ/ngày</span>
                            </div>
                          </div>
                          {values.room_id === room.id.toString() && (
                            <Badge bg="primary" className="rounded-circle p-2">
                              <FaCheck />
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="warning">
                Không có phòng trống cho loại phòng và thời gian đã chọn. Vui lòng chọn loại phòng khác hoặc thay đổi thời gian.
              </Alert>
            )}
            
            {touched.room_id && errors.room_id && (
              <div className="text-danger mt-2">{errors.room_id}</div>
            )}
          </Form.Group>
          
          <div className="d-flex justify-content-between mt-4">
  <Button
    variant="outline-secondary"
    onClick={() => setStep(1)}
  >
    Quay lại
  </Button>
  <Button
    variant="primary"
    onClick={() => {
      console.log('Current room_id value:', values.room_id);
      console.log('Available rooms:', availableRooms);
      
      if (!values.room_id) {
        // Sửa lại cách set touched cho validation
        formikProps.setFieldTouched('room_id', true);
        console.log('Room not selected, showing validation error');
        return;
      }
      
      console.log('Moving to step 3');
      setStep(3);
    }}
    disabled={availableRooms.length === 0}
  >
    Tiếp tục <FaArrowRight className="ms-2" />
  </Button>
</div>
        </Card.Body>
      </Card>
    );
  };

  // Render Step 3: Select services and food
  const renderStep3 = (formikProps) => {
    const { values, errors, touched, setFieldValue } = formikProps;
    const selectedRoomType = roomTypes.find(rt => rt.id === parseInt(values.room_type_id));
    const selectedRoom = availableRooms.find(r => r.id === parseInt(values.room_id));
    
    // Toggle service selection
    const toggleService = (serviceId) => {
      const currentServices = [...values.selected_services];
      const index = currentServices.indexOf(serviceId);
      
      if (index === -1) {
        currentServices.push(serviceId);
      } else {
        currentServices.splice(index, 1);
      }
      
      setFieldValue('selected_services', currentServices);
    };
    
    // Toggle food selection
    const toggleFood = (foodId) => {
      const currentFoods = [...values.selected_foods];
      const index = currentFoods.indexOf(foodId);
      
      if (index === -1) {
        currentFoods.push(foodId);
      } else {
        currentFoods.splice(index, 1);
      }
      
      setFieldValue('selected_foods', currentFoods);
    };
    
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Chọn dịch vụ và thức ăn</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <div className="p-3 bg-light rounded-3 border">
              <Row className="align-items-center">
                <Col md={8}>
                  <h6 className="mb-0">Thông tin đã chọn:</h6>
                  <div className="mt-2">
                    <div className="d-flex align-items-center mb-1">
                      <FaBed className="text-primary me-2" />
                      <span>Phòng: <strong>{selectedRoom?.room_number} ({selectedRoomType?.name})</strong></span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <FaCalendarAlt className="text-primary me-2" />
                      <span>Thời gian: <strong>{format(values.check_in_date, 'dd/MM/yyyy', { locale: vi })} đến {format(values.check_out_date, 'dd/MM/yyyy', { locale: vi })}</strong></span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-primary me-2" />
                      <span>Số ngày: <strong>{differenceInDays(values.check_out_date, values.check_in_date)} ngày</strong></span>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setStep(2)}
                  >
                    Thay đổi
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          <Tabs defaultActiveKey="services" id="services-food-tabs" className="mb-4">
            <Tab eventKey="services" title={<span><FaSpa className="me-2" />Dịch vụ</span>}>
              <div className="p-3">
                <Form.Label className="fw-bold mb-3">Chọn dịch vụ bổ sung</Form.Label>
                <Row className="gy-3">
                  {services.map(service => (
                    <Col md={6} key={service.id}>
                      <Card 
                        className={`service-card h-100 ${values.selected_services.includes(service.id) ? 'border-primary' : ''}`}
                        onClick={() => toggleService(service.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="mb-1">
                                {service.name}
                              </h5>
                              <p className="text-muted small mb-2">{service.description}</p>
                              <div className="fw-bold text-primary">
                                {Number(service.price).toLocaleString()} VNĐ
                                <span className="fw-normal text-muted"> / ngày</span>
                              </div>
                            </div>
                            <div>
                              {getServiceIcon(service.name)}
                            </div>
                          </div>
                        </Card.Body>
                        {values.selected_services.includes(service.id) && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <Badge bg="primary" className="rounded-circle p-2">
                              <FaCheck />
                            </Badge>
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Tab>
            <Tab eventKey="food" title={<span><FaUtensils className="me-2" />Thức ăn</span>}>
              <div className="p-3">
                <Form.Label className="fw-bold mb-3">Chọn thức ăn cho mèo</Form.Label>
                <Row className="gy-3">
                  {foods.map(food => (
                    <Col md={6} key={food.id}>
                      <Card 
                        className={`food-card h-100 ${values.selected_foods.includes(food.id) ? 'border-primary' : ''}`}
                        onClick={() => toggleFood(food.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="mb-1">
                                {food.name}
                              </h5>
                              <p className="text-muted small mb-2">{food.description}</p>
                              <div className="fw-bold text-primary">
                                {Number(food.price).toLocaleString()} VNĐ
                                <span className="fw-normal text-muted"> / ngày</span>
                              </div>
                            </div>
                            <div>
                              <FaBoxOpen className="text-warning" size={28} />
                            </div>
                          </div>
                        </Card.Body>
                        {values.selected_foods.includes(food.id) && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <Badge bg="primary" className="rounded-circle p-2">
                              <FaCheck />
                            </Badge>
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Tab>
          </Tabs>
          
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => setStep(2)}
            >
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(4)}
            >
              Tiếp tục <FaArrowRight className="ms-2" />
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render Step 4: Confirmation
  const renderStep4 = (formikProps) => {
    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = formikProps;
    const selectedRoomType = roomTypes.find(rt => rt.id === parseInt(values.room_type_id));
    const selectedRoom = availableRooms.find(r => r.id === parseInt(values.room_id));
    const selectedServices = services.filter(s => values.selected_services.includes(s.id));
    const selectedFoods = foods.filter(f => values.selected_foods.includes(f.id));
    
    const days = differenceInDays(values.check_out_date, values.check_in_date);
    const roomPrice = selectedRoomType ? selectedRoomType.price_per_day * days : 0;
    const servicePrice = selectedServices.reduce((total, service) => total + (service.price * days), 0);
    const foodPrice = selectedFoods.reduce((total, food) => total + (food.price * days), 0);
    const totalPrice = roomPrice + servicePrice + foodPrice;
    
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Xác nhận đặt phòng</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col lg={7}>
              <h5 className="mb-4">
                <FaClipboard className="me-2 text-primary" />
                Chi tiết đặt phòng
              </h5>
              
              <div className="booking-details mb-4">
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <h6 className="mb-3">Thông tin phòng</h6>
                  <div className="d-flex align-items-center mb-2">
                    <FaBed className="text-primary me-2" />
                    <div>
                      <div>Phòng: <strong>{selectedRoom?.room_number}</strong></div>
                      <div>Loại phòng: <strong>{selectedRoomType?.name}</strong></div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-primary me-2" />
                    <div>
                      <div>Nhận phòng: <strong>{format(values.check_in_date, 'dd/MM/yyyy', { locale: vi })}</strong></div>
                      <div>Trả phòng: <strong>{format(values.check_out_date, 'dd/MM/yyyy', { locale: vi })}</strong></div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaClock className="text-primary me-2" />
                    <div>Thời gian lưu trú: <strong>{days} ngày</strong></div>
                  </div>
                </div>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FaCat className="me-2 text-primary" />
                    Chọn mèo
                  </Form.Label>
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
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <FaClipboard className="me-2 text-primary" />
                    Yêu cầu đặc biệt
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="special_requests"
                    value={values.special_requests}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập yêu cầu đặc biệt cho mèo của bạn (nếu có)"
                  />
                </Form.Group>
                
                {selectedServices.length > 0 && (
                  <div className="selected-services mb-4">
                    <h6 className="mb-3">
                      <FaSpa className="me-2 text-primary" />
                      Dịch vụ đã chọn
                    </h6>
                    <ListGroup variant="flush" className="border rounded">
                      {selectedServices.map(service => (
                        <ListGroup.Item key={service.id} className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {getServiceIcon(service.name)}
                            <div className="ms-3">
                              <div className="fw-medium">{service.name}</div>
                              <small className="text-muted">{service.description}</small>
                            </div>
                          </div>
                          <div className="text-primary">
                            {Number(service.price).toLocaleString()} VNĐ/ngày
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
                
                {selectedFoods.length > 0 && (
                  <div className="selected-foods mb-4">
                    <h6 className="mb-3">
                      <FaUtensils className="me-2 text-primary" />
                      Thức ăn đã chọn
                    </h6>
                    <ListGroup variant="flush" className="border rounded">
                      {selectedFoods.map(food => (
                        <ListGroup.Item key={food.id} className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <FaBoxOpen className="text-warning" size={24} />
                            <div className="ms-3">
                              <div className="fw-medium">{food.name}</div>
                              <small className="text-muted">{food.description}</small>
                            </div>
                          </div>
                          <div className="text-primary">
                            {Number(food.price).toLocaleString()} VNĐ/ngày
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            </Col>
            
            <Col lg={5}>
              <Card className="border-0 bg-light">
                <Card.Body className="p-4">
                  <h5 className="mb-4">
                    <FaMoneyBillWave className="me-2 text-primary" />
                    Chi tiết thanh toán
                  </h5>
                  
                  <div className="price-details">
                    <div className="d-flex justify-content-between mb-3">
                      <div>Giá phòng ({days} ngày)</div>
                      <div className="fw-bold">{Number(roomPrice).toLocaleString()} VNĐ</div>
                    </div>
                    
                    {servicePrice > 0 && (
                      <div className="d-flex justify-content-between mb-3">
                        <div>Dịch vụ ({selectedServices.length} dịch vụ)</div>
                        <div className="fw-bold">{Number(servicePrice).toLocaleString()} VNĐ</div>
                      </div>
                    )}
                    
                    {foodPrice > 0 && (
                      <div className="d-flex justify-content-between mb-3">
                        <div>Thức ăn ({selectedFoods.length} loại)</div>
                        <div className="fw-bold">{Number(foodPrice).toLocaleString()} VNĐ</div>
                      </div>
                    )}
                    
                    <hr />
                    
                    <div className="d-flex justify-content-between mb-1">
                      <div className="fw-bold fs-5">Tổng tiền</div>
                      <div className="fw-bold fs-5 text-primary">{Number(totalPrice).toLocaleString()} VNĐ</div>
                    </div>
                    <div className="text-muted small text-end mb-3">Đã bao gồm thuế và phí</div>
                    
                    <div className="alert alert-info p-2 small">
                      <div className="d-flex">
                        <FaCat className="text-primary me-2 mt-1" />
                        <div>
                          Meow Hotel cam kết chăm sóc mèo cưng của bạn trong thời gian lưu trú với chất lượng tốt nhất.
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mt-3"
                      onClick={handleSubmit}
                      disabled={loading || !values.cat_id}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" size="sm" animation="border" className="me-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Xác nhận đặt phòng'
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => setStep(3)}
            >
              Quay lại
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="booking-steps mb-4">
        <Row className="text-center">
          <Col xs={3}>
            <div 
              className={`step-circle mx-auto mb-2 ${step >= 1 ? 'active' : ''}`}
              style={{ cursor: step > 1 ? 'pointer' : 'default' }}
              onClick={() => step > 1 && setStep(1)}
            >
              <FaCalendarAlt />
            </div>
            <div className={`step-title ${step >= 1 ? 'text-primary fw-bold' : ''}`}>
              Chọn ngày & loại phòng
            </div>
          </Col>
          <Col xs={3}>
            <div 
              className={`step-circle mx-auto mb-2 ${step >= 2 ? 'active' : ''}`}
              style={{ cursor: step > 2 ? 'pointer' : 'default' }}
              onClick={() => step > 2 && setStep(2)}
            >
              <FaBed />
            </div>
            <div className={`step-title ${step >= 2 ? 'text-primary fw-bold' : ''}`}>
              Chọn phòng
            </div>
          </Col>
          <Col xs={3}>
            <div 
              className={`step-circle mx-auto mb-2 ${step >= 3 ? 'active' : ''}`}
              style={{ cursor: step > 3 ? 'pointer' : 'default' }}
              onClick={() => step > 3 && setStep(3)}
            >
              <FaSpa />
            </div>
            <div className={`step-title ${step >= 3 ? 'text-primary fw-bold' : ''}`}>
              Dịch vụ & Thức ăn
            </div>
          </Col>
          <Col xs={3}>
            <div className={`step-circle mx-auto mb-2 ${step >= 4 ? 'active' : ''}`}>
              <FaClipboard />
            </div>
            <div className={`step-title ${step >= 4 ? 'text-primary fw-bold' : ''}`}>
              Xác nhận
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <div className="booking-container">
        <div className="text-center mb-5">
          <h2 className="mb-2">Đặt phòng cho mèo cưng</h2>
          <p className="text-muted lead">Chọn phòng và dịch vụ phù hợp nhất cho người bạn lông xù của bạn</p>
        </div>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {renderStepIndicator()}
        
        <Formik
          initialValues={bookingData}
          validationSchema={bookingSchema}
          onSubmit={handleBookingSubmit}
        >
          {(formikProps) => (
            <>
              {step === 1 && renderStep1(formikProps)}
              {step === 2 && renderStep2(formikProps)}
              {step === 3 && renderStep3(formikProps)}
              {step === 4 && renderStep4(formikProps)}
            </>
          )}
        </Formik>
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
          position: relative;
        }
        
        .booking-steps .step-circle.active {
          background-color: #0d6efd;
          color: white;
        }
        
        .booking-steps .step-title {
          font-size: 0.9rem;
          margin-top: 8px;
        }
        
        .booking-steps .step-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 100%;
          width: calc(100% - 20px);
          height: 2px;
          background-color: #f0f0f0;
          transform: translateY(-50%);
        }
        
        .booking-steps .step-circle.active::after {
          background-color: #0d6efd;
        }
        
        .booking-steps .step-circle:last-child::after {
          display: none;
        }
        
        .room-type-card:hover,
        .room-card:hover,
        .service-card:hover,
        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        .room-type-card,
        .room-card,
        .service-card,
        .food-card {
          transition: all 0.3s ease;
        }
      `}</style>
    </Container>
  );
};

export default BookRoom;