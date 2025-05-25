import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaUtensils, FaBoxOpen, FaImage } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import foodService from '../../api/foodService';

// Schema validation cho form thức ăn
const foodSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên thức ăn là bắt buộc')
    .max(100, 'Tên thức ăn không được quá 100 ký tự'),
  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),
  price: Yup.number()
    .required('Giá thức ăn là bắt buộc')
    .positive('Giá thức ăn phải là số dương')
});

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  // Fetch thức ăn
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await foodService.getFoods();
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setError('Không thể tải danh sách thức ăn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Hiển thị thông báo thành công và tự động ẩn sau 3 giây
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Xử lý khi chọn file ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
      return;
    }

    // Kiểm tra kích thước file (tối đa 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước file không được quá 2MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Tạo preview cho ảnh
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý thêm/cập nhật thức ăn
  const handleFoodSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      
      // Tạo FormData để gửi cả thông tin và file ảnh
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('price', values.price);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      if (selectedFood) {
        // Cập nhật thức ăn hiện có
        await foodService.updateFood(selectedFood.id, formData);
        showSuccess('Cập nhật thức ăn thành công!');
      } else {
        // Thêm thức ăn mới
        await foodService.createFood(formData);
        showSuccess('Thêm thức ăn mới thành công!');
      }
      
      // Làm mới danh sách thức ăn
      fetchFoods();
      resetForm();
      setShowFoodModal(false);
      setImageFile(null);
      setPreviewImage('');
      
    } catch (error) {
      console.error('Error saving food:', error);
      setError(error.response?.data?.message || 'Không thể lưu thông tin thức ăn.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa thức ăn
  const handleDeleteFood = async () => {
    try {
      setError('');
      
      await foodService.deleteFood(selectedFood.id);
      
      // Làm mới danh sách thức ăn
      fetchFoods();
      setShowDeleteModal(false);
      showSuccess('Xóa thức ăn thành công!');
      
    } catch (error) {
      console.error('Error deleting food:', error);
      setError(error.response?.data?.message || 'Không thể xóa thức ăn. Thức ăn có thể đang được sử dụng.');
    }
  };

  // Mở modal thêm/sửa thức ăn
  const openFoodModal = (food = null) => {
    setSelectedFood(food);
    setPreviewImage(food?.image_url || '');
    setImageFile(null);
    setShowFoodModal(true);
  };

  // Mở modal xóa thức ăn
  const openDeleteModal = (food) => {
    setSelectedFood(food);
    setShowDeleteModal(true);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý thức ăn</h2>
          <p className="text-muted">Quản lý tất cả các loại thức ăn trong hệ thống</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => openFoodModal()}
        >
          <FaPlus className="me-2" /> Thêm thức ăn mới
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
              <p className="mt-3">Đang tải dữ liệu thức ăn...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Hình ảnh</th>
                    <th>Tên thức ăn</th>
                    <th>Mô tả</th>
                    <th>Giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.length > 0 ? (
                    foods.map(food => (
                      <tr key={food.id}>
                        <td>{food.id}</td>
                        <td>
                          {food.image_url ? (
                            <img 
                              src={food.image_url} 
                              alt={food.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                              }}
                            />
                          ) : (
                            <div 
                              className="bg-light d-flex align-items-center justify-content-center"
                              style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                            >
                              <FaImage className="text-muted" />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaBoxOpen className="text-warning me-2" />
                            <span>{food.name}</span>
                          </div>
                        </td>
                        <td>{food.description || 'Không có mô tả'}</td>
                        <td>
                          <Badge bg="success">
                            {Number(food.price).toLocaleString()} VNĐ/ngày
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-2"
                            onClick={() => openFoodModal(food)}
                          >
                            <FaEdit /> Sửa
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => openDeleteModal(food)}
                          >
                            <FaTrash /> Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        Không có thức ăn nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal thêm/sửa thức ăn */}
      <Modal 
        show={showFoodModal} 
        onHide={() => setShowFoodModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedFood ? 'Sửa thông tin thức ăn' : 'Thêm thức ăn mới'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: selectedFood?.name || '',
            description: selectedFood?.description || '',
            price: selectedFood?.price || ''
          }}
          validationSchema={foodSchema}
          onSubmit={handleFoodSubmit}
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
                <Row>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên thức ăn <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                        placeholder="Nhập tên thức ăn"
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
                        placeholder="Nhập mô tả thức ăn"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Giá thức ăn (VNĐ/ngày) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.price && errors.price}
                        placeholder="Nhập giá thức ăn"
                        min="0"
                        step="10000"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={5}>
                    <div className="image-preview-container mb-3 text-center">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Food preview" 
                          className="img-thumbnail" 
                          style={{ maxHeight: '150px', maxWidth: '100%' }}
                        />
                      ) : (
                        <div className="no-image-placeholder p-5 bg-light rounded text-center">
                          <FaImage size={50} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Chưa có hình ảnh</p>
                        </div>
                      )}
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Hình ảnh thức ăn</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageChange}
                      />
                      <Form.Text className="text-muted">
                        Hỗ trợ định dạng JPG, PNG, GIF. Kích thước tối đa 2MB.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowFoodModal(false)}>
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
                    selectedFood ? 'Cập nhật' : 'Thêm thức ăn'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
      
      {/* Modal xác nhận xóa thức ăn */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa thức ăn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFood && (
            <p>
              Bạn có chắc chắn muốn xóa thức ăn <strong>{selectedFood.name}</strong>?
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
            onClick={handleDeleteFood}
          >
            Xóa thức ăn
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FoodManagement;