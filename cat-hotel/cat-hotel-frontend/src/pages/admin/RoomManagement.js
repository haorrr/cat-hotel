import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaBed, FaTools, FaDoorOpen } from 'react-icons/fa';
import roomService from '../../api/roomService';
import adminService from '../../api/adminService';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Schema validation for room status form
const roomStatusSchema = Yup.object().shape({
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['available', 'occupied', 'maintenance'], 'Trạng thái không hợp lệ')
});

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get rooms
        const roomsResponse = await roomService.getRooms();
        setRooms(roomsResponse.data);
        
        // Get room types
        const roomTypesResponse = await roomService.getRoomTypes();
        setRoomTypes(roomTypesResponse.data);
        
      } catch (error) {
        console.error('Error fetching rooms data:', error);
        setError('Không thể tải dữ liệu phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Show success message and clear after a delay
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle status update
  const handleStatusUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      await adminService.updateRoomStatus(selectedRoom.id, values.status);
      
      // Update local state
      setRooms(rooms.map(room => {
        if (room.id === selectedRoom.id) {
          return { ...room, status: values.status };
        }
        return room;
      }));
      
      setShowStatusModal(false);
      showSuccess('Cập nhật trạng thái phòng thành công!');
      
    } catch (error) {
      console.error('Error updating room status:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật trạng thái phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open status modal
  const openStatusModal = (room) => {
    setSelectedRoom(room);
    setShowStatusModal(true);
  };

  // Filter rooms
  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(room => room.status === filter);

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">Còn trống</Badge>;
      case 'occupied':
        return <Badge bg="danger">Đã đặt</Badge>;
      case 'maintenance':
        return <Badge bg="warning">Bảo trì</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaDoorOpen className="text-success" />;
      case 'occupied':
        return <FaCheck className="text-danger" />;
      case 'maintenance':
        return <FaTools className="text-warning" />;
      default:
        return <FaBed />;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý phòng</h2>
          <p className="text-muted">Quản lý tất cả các phòng và trạng thái</p>
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Danh sách phòng</h5>
            </div>
            <div className="d-flex align-items-center">
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="me-2"
                style={{ width: '200px' }}
              >
                <option value="all">Tất cả phòng</option>
                <option value="available">Còn trống</option>
                <option value="occupied">Đã đặt</option>
                <option value="maintenance">Bảo trì</option>
              </Form.Select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu phòng...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Số phòng</th>
                    <th>Loại phòng</th>
                    <th>Giá/ngày</th>
                    <th>Sức chứa</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => {
                      // Find room type details
                      const roomType = roomTypes.find(type => type.id === room.room_type_id);
                      
                      return (
                        <tr key={room.id}>
                          <td>{room.room_number}</td>
                          <td>{roomType?.name || 'N/A'}</td>
                          <td>{Number(roomType?.price_per_day || 0).toLocaleString()} VNĐ</td>
                          <td>{roomType?.capacity || 1} mèo</td>
                          <td>{getStatusBadge(room.status)}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="me-2"
                              onClick={() => openStatusModal(room)}
                            >
                              <FaEdit className="me-1" /> Đổi trạng thái
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        Không tìm thấy phòng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Room Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái phòng</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            status: selectedRoom?.status || 'available'
          }}
          validationSchema={roomStatusSchema}
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
                {selectedRoom && (
                  <div className="mb-3">
                    <h5>{selectedRoom.room_number}</h5>
                    <p className="text-muted">
                      Trạng thái hiện tại: {getStatusBadge(selectedRoom.status)}
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
                    <option value="available">Còn trống</option>
                    <option value="occupied">Đã đặt</option>
                    <option value="maintenance">Bảo trì</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status}
                  </Form.Control.Feedback>
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

export default RoomManagement;