import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaBed, FaTools, FaDoorOpen, FaSearch, FaFilter } from 'react-icons/fa';
import roomService from '../../api/roomService';
import adminService from '../../api/adminService';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import RoomForm from './components/RoomForm';
import RoomTypeForm from './components/RoomTypeForm';
import RoomTypeCard from './components/RoomTypeCard';

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
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [showDeleteRoomTypeModal, setShowDeleteRoomTypeModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách phòng
      const roomsResponse = await roomService.getRooms();
      setRooms(roomsResponse.data);
      
      // Lấy danh sách loại phòng
      const roomTypesResponse = await roomService.getRoomTypes();
      setRoomTypes(roomTypesResponse.data);
      
    } catch (error) {
      console.error('Error fetching rooms data:', error);
      setError('Không thể tải dữ liệu phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo thành công và tự động ẩn sau 3 giây
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Xử lý cập nhật trạng thái phòng
  const handleStatusUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      await adminService.updateRoomStatus(selectedRoom.id, values.status);
      
      // Cập nhật state local
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

  // Xử lý thêm/cập nhật phòng
  const handleRoomSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      
      if (selectedRoom) {
        // Cập nhật phòng hiện có
        await roomService.updateRoom(selectedRoom.id, values);
        showSuccess('Cập nhật phòng thành công!');
      } else {
        // Thêm phòng mới
        await roomService.createRoom(values);
        showSuccess('Thêm phòng mới thành công!');
      }
      
      // Làm mới danh sách phòng
      fetchData();
      
      if (typeof resetForm === 'function') {
        resetForm();
      }
      
      setShowRoomModal(false);
      
    } catch (error) {
      console.error('Error saving room:', error);
      setError(error.response?.data?.message || 'Không thể lưu thông tin phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa phòng
  const handleDeleteRoom = async () => {
    try {
      setError('');
      
      await roomService.deleteRoom(selectedRoom.id);
      
      // Làm mới danh sách phòng
      fetchData();
      setShowDeleteRoomModal(false);
      showSuccess('Xóa phòng thành công!');
      
    } catch (error) {
      console.error('Error deleting room:', error);
      setError(error.response?.data?.message || 'Không thể xóa phòng. Phòng có thể đang được sử dụng.');
    }
  };

  // Xử lý thêm/cập nhật loại phòng
  const handleRoomTypeSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      let result;
      
      if (selectedRoomType) {
        // Cập nhật loại phòng hiện có
        result = await roomService.updateRoomType(selectedRoomType.id, values);
        showSuccess('Cập nhật loại phòng thành công!');
      } else {
        // Thêm loại phòng mới
        result = await roomService.createRoomType(values);
        showSuccess('Thêm loại phòng mới thành công!');
      }
      
      // Làm mới danh sách loại phòng
      fetchData();
      
      if (typeof resetForm === 'function') {
        resetForm();
      }
      
      setShowRoomTypeModal(false);
      
      // Trả về kết quả để RoomTypeForm có thể sử dụng
      return result.data;
      
    } catch (error) {
      console.error('Error saving room type:', error);
      setError(error.response?.data?.message || 'Không thể lưu thông tin loại phòng.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa loại phòng
  const handleDeleteRoomType = async () => {
    try {
      setError('');
      
      await roomService.deleteRoomType(selectedRoomType.id);
      
      // Làm mới danh sách loại phòng
      fetchData();
      setShowDeleteRoomTypeModal(false);
      showSuccess('Xóa loại phòng thành công!');
      
    } catch (error) {
      console.error('Error deleting room type:', error);
      setError(error.response?.data?.message || 'Không thể xóa loại phòng. Loại phòng có thể đang được sử dụng.');
    }
  };

  // Mở modal trạng thái phòng
  const openStatusModal = (room) => {
    setSelectedRoom(room);
    setShowStatusModal(true);
  };

  // Mở modal thêm/sửa phòng
  const openRoomModal = (room = null) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  // Mở modal xóa phòng
  const openDeleteRoomModal = (room) => {
    setSelectedRoom(room);
    setShowDeleteRoomModal(true);
  };

  // Mở modal thêm/sửa loại phòng
  const openRoomTypeModal = (roomType = null) => {
    setSelectedRoomType(roomType);
    setShowRoomTypeModal(true);
  };

  // Mở modal xóa loại phòng
  const openDeleteRoomTypeModal = (roomType) => {
    setSelectedRoomType(roomType);
    setShowDeleteRoomTypeModal(true);
  };

  // Lọc phòng theo trạng thái
  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(room => room.status === filter);

  // Lọc phòng theo từ khóa tìm kiếm
  const searchFilteredRooms = searchTerm
    ? filteredRooms.filter(room => 
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredRooms;

  // Lấy badge trạng thái
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

  // Lấy icon trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaDoorOpen className="text-success" />;
      case 'occupied':
        return <FaBed className="text-danger" />;
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
          <p className="text-muted">Quản lý tất cả các phòng, loại phòng và trạng thái</p>
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
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="rooms" title="Quản lý phòng">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="me-2"
                    style={{ width: '250px' }}
                  />
                  <Form.Select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="all">Tất cả phòng</option>
                    <option value="available">Còn trống</option>
                    <option value="occupied">Đã đặt</option>
                    <option value="maintenance">Bảo trì</option>
                  </Form.Select>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => openRoomModal()}
                >
                  <FaPlus className="me-2" /> Thêm phòng mới
                </Button>
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
                      {searchFilteredRooms.length > 0 ? (
                        searchFilteredRooms.map(room => {
                          // Tìm thông tin loại phòng
                          const roomType = roomTypes.find(type => type.id === room.room_type_id);
                          
                          return (
                            <tr key={room.id}>
                              <td>{room.room_number}</td>
                              <td>{room.room_type_name || roomType?.name || 'N/A'}</td>
                              <td>{Number(room.price_per_day || roomType?.price_per_day || 0).toLocaleString()} VNĐ</td>
                              <td>{room.capacity || roomType?.capacity || 1} mèo</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getStatusIcon(room.status)}
                                  <span className="ms-2">{getStatusBadge(room.status)}</span>
                                </div>
                              </td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="me-2"
                                  onClick={() => openRoomModal(room)}
                                >
                                  <FaEdit /> Sửa
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  className="me-2"
                                  onClick={() => openDeleteRoomModal(room)}
                                >
                                  <FaTrash /> Xóa
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => openStatusModal(room)}
                                >
                                  Trạng thái
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-3">
                            {searchTerm ? 'Không tìm thấy phòng phù hợp' : 'Không có phòng nào'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="roomTypes" title="Quản lý loại phòng">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Danh sách loại phòng</h5>
                <Button 
                  variant="primary"
                  onClick={() => openRoomTypeModal()}
                >
                  <FaPlus className="me-2" /> Thêm loại phòng mới
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Đang tải dữ liệu loại phòng...</p>
                </div>
              ) : (
                <Row>
                  {roomTypes.length > 0 ? (
                    roomTypes.map(roomType => (
                      <Col lg={4} md={6} className="mb-4" key={roomType.id}>
                        <RoomTypeCard 
                          roomType={roomType} 
                          onEdit={() => openRoomTypeModal(roomType)}
                          onDelete={() => openDeleteRoomTypeModal(roomType)}
                        />
                      </Col>
                    ))
                  ) : (
                    <Col xs={12}>
                      <div className="text-center py-5 bg-light rounded">
                        <p className="mb-0">Chưa có loại phòng nào. Hãy thêm loại phòng mới!</p>
                      </div>
                    </Col>
                  )}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Modal cập nhật trạng thái phòng */}
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
      
      {/* Modal thêm/sửa phòng */}
      <Modal 
        show={showRoomModal} 
        onHide={() => setShowRoomModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}</Modal.Title>
        </Modal.Header>
        <RoomForm 
          room={selectedRoom}
          roomTypes={roomTypes}
          onSubmit={handleRoomSubmit}
          onCancel={() => setShowRoomModal(false)}
        />
      </Modal>
      
      {/* Modal xác nhận xóa phòng */}
      <Modal show={showDeleteRoomModal} onHide={() => setShowDeleteRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <p>
              Bạn có chắc chắn muốn xóa phòng <strong>{selectedRoom.room_number}</strong>?
              Hành động này không thể hoàn tác.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteRoomModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteRoom}
          >
            Xóa phòng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal thêm/sửa loại phòng */}
      <Modal 
        show={showRoomTypeModal} 
        onHide={() => setShowRoomTypeModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedRoomType ? 'Sửa loại phòng' : 'Thêm loại phòng mới'}</Modal.Title>
        </Modal.Header>
        <RoomTypeForm 
          roomType={selectedRoomType}
          onSubmit={handleRoomTypeSubmit}
          onCancel={() => setShowRoomTypeModal(false)}
        />
      </Modal>
      
      {/* Modal xác nhận xóa loại phòng */}
      <Modal show={showDeleteRoomTypeModal} onHide={() => setShowDeleteRoomTypeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa loại phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoomType && (
            <>
              <p>
                Bạn có chắc chắn muốn xóa loại phòng <strong>{selectedRoomType.name}</strong>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="alert alert-warning">
                <strong>Cảnh báo:</strong> Nếu có phòng nào đang sử dụng loại phòng này, 
                việc xóa có thể sẽ không thành công hoặc gây lỗi hệ thống.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteRoomTypeModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteRoomType}
          >
            Xóa loại phòng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagement;