import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSpa, FaShower, FaClipboard, FaCut } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import serviceService from '../../api/serviceService';

// Schema validation cho form dịch vụ
const serviceSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên dịch vụ là bắt buộc')
    .max(100, 'Tên dịch vụ không được quá 100 ký tự'),
  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),
  price: Yup.number()
    .required('Giá dịch vụ là bắt buộc')
    .positive('Giá dịch vụ phải là số dương')
});

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch dịch vụ
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Hiển thị thông báo thành công và tự động ẩn sau 3 giây
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Xử lý thêm/cập nhật dịch vụ
  const handleServiceSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      
      if (selectedService) {
        // Cập nhật dịch vụ hiện có
        await serviceService.updateService(selectedService.id, values);
        showSuccess('Cập nhật dịch vụ thành công!');
      } else {
        // Thêm dịch vụ mới
        await serviceService.createService(values);
        showSuccess('Thêm dịch vụ mới thành công!');
      }
      
      // Làm mới danh sách dịch vụ
      fetchServices();
      resetForm();
      setShowServiceModal(false);
      
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.response?.data?.message || 'Không thể lưu thông tin dịch vụ.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa dịch vụ
  const handleDeleteService = async () => {
    try {
      setError('');
      
      await serviceService.deleteService(selectedService.id);
      
      // Làm mới danh sách dịch vụ
      fetchServices();
      setShowDeleteModal(false);
      showSuccess('Xóa dịch vụ thành công!');
      
    } catch (error) {
      console.error('Error deleting service:', error);
      setError(error.response?.data?.message || 'Không thể xóa dịch vụ. Dịch vụ có thể đang được sử dụng.');
    }
  };

  // Mở modal thêm/sửa dịch vụ
  const openServiceModal = (service = null) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  // Mở modal xóa dịch vụ
  const openDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  // Get service icon based on service name
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('tắm') || name.includes('spa')) {
      return <FaShower className="text-info" size={20} />;
    } else if (name.includes('cắt') || name.includes('tỉa')) {
      return <FaCut className="text-warning" size={20} />;
    } else if (name.includes('khám') || name.includes('y tế')) {
      return <FaClipboard className="text-danger" size={20} />;
    } else {
      return <FaSpa className="text-success" size={20} />;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý dịch vụ</h2>
          <p className="text-muted">Quản lý tất cả các dịch vụ trong hệ thống</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => openServiceModal()}
        >
          <FaPlus className="me-2" /> Thêm dịch vụ mới
        </Button>
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
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu dịch vụ...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Mã dịch vụ</th>
                    <th>Tên dịch vụ</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length > 0 ? (
                    services.map(service => (
                      <tr key={service.id}>
                        <td>{service.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getServiceIcon(service.name)}
                            <span className="ms-2">{service.name}</span>
                          </div>
                        </td>
                        <td>{service.description || 'Không có mô tả'}</td>
                        <td>
                          <Badge bg="success">
                            {Number(service.price).toLocaleString()} VNĐ/ngày
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-2"
                            onClick={() => openServiceModal(service)}
                          >
                            <FaEdit /> Sửa
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => openDeleteModal(service)}
                          >
                            <FaTrash /> Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        Không có dịch vụ nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal thêm/sửa dịch vụ */}
      <Modal 
        show={showServiceModal} 
        onHide={() => setShowServiceModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedService ? 'Sửa thông tin dịch vụ' : 'Thêm dịch vụ mới'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: selectedService?.name || '',
            description: selectedService?.description || '',
            price: selectedService?.price || ''
          }}
          validationSchema={serviceSchema}
          onSubmit={handleServiceSubmit}
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
                <Form.Group className="mb-3">
                  <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                    placeholder="Nhập tên dịch vụ"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                    placeholder="Nhập mô tả dịch vụ"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Giá dịch vụ (VNĐ/ngày) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={values.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.price && errors.price}
                    placeholder="Nhập giá dịch vụ"
                    min="0"
                    step="10000"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang lưu...
                    </>
                  ) : (
                    selectedService ? 'Cập nhật' : 'Thêm dịch vụ'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
      
      {/* Modal xác nhận xóa dịch vụ */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa dịch vụ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <p>
              Bạn có chắc chắn muốn xóa dịch vụ <strong>{selectedService.name}</strong>?
              Hành động này không thể hoàn tác.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteService}
          >
            Xóa dịch vụ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceManagement;