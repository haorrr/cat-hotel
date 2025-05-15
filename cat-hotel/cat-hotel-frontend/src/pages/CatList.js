import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCat, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Formik } from 'formik';
import * as Yup from 'yup';
import catService from '../api/catService';

// Schema validation cho form thêm/sửa mèo
const catSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên mèo là bắt buộc'),
  breed: Yup.string(),
  weight: Yup.number()
    .positive('Cân nặng phải là số dương')
    .nullable(),
  birth_date: Yup.date()
    .max(new Date(), 'Ngày sinh không thể trong tương lai')
    .nullable(),
  gender: Yup.string()
    .oneOf(['male', 'female', 'unknown'], 'Giới tính không hợp lệ'),
  notes: Yup.string()
});

const CatList = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCat, setCurrentCat] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch danh sách mèo
  const fetchCats = async () => {
    try {
      setLoading(true);
      const response = await catService.getCats();
      setCats(response.data);
    } catch (err) {
      console.error('Error fetching cats:', err);
      setError('Đã xảy ra lỗi khi tải danh sách mèo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  // Hiển thị thông báo thành công và tự động ẩn sau 3 giây
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Mở modal thêm mèo
  const handleAddCat = () => {
    setShowAddModal(true);
  };

  // Mở modal sửa mèo
  const handleEditCat = (cat) => {
    setCurrentCat(cat);
    setShowEditModal(true);
  };

  // Mở modal xóa mèo
  const handleDeleteCat = (cat) => {
    setCurrentCat(cat);
    setShowDeleteModal(true);
  };

  // Xử lý thêm mèo mới
  const handleAddSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      await catService.createCat(values);
      resetForm();
      setShowAddModal(false);
      showSuccess('Thêm mèo thành công!');
      fetchCats();
    } catch (err) {
      console.error('Error adding cat:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi thêm mèo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý cập nhật thông tin mèo
  const handleEditSubmit = async (values, { setSubmitting }) => {
    try {
      await catService.updateCat(currentCat.id, values);
      setShowEditModal(false);
      showSuccess('Cập nhật thông tin mèo thành công!');
      fetchCats();
    } catch (err) {
      console.error('Error updating cat:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin mèo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa mèo
  const handleDeleteSubmit = async () => {
    try {
      await catService.deleteCat(currentCat.id);
      setShowDeleteModal(false);
      showSuccess('Xóa mèo thành công!');
      fetchCats();
    } catch (err) {
      console.error('Error deleting cat:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi xóa mèo.');
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý mèo</h2>
          <p className="text-muted">Thêm và quản lý thông tin mèo cưng của bạn</p>
        </div>
        <Button variant="primary" onClick={handleAddCat}>
          <FaPlus className="me-2" /> Thêm mèo mới
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải danh sách mèo...</p>
        </div>
      ) : cats.length > 0 ? (
        <Row>
          {cats.map(cat => (
            <Col lg={4} md={6} className="mb-4" key={cat.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-circle p-3 me-3">
                      <FaCat className="text-primary" size={30} />
                    </div>
                    <div>
                      <h4 className="mb-0">{cat.name}</h4>
                      <p className="text-muted mb-0">
                        {cat.breed || 'Không có giống'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="cat-info mb-3">
                    <div className="row mb-2">
                      <div className="col-4 text-muted">Giới tính:</div>
                      <div className="col-8">
                        {cat.gender === 'male' ? 'Đực' : cat.gender === 'female' ? 'Cái' : 'Không xác định'}
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-4 text-muted">Cân nặng:</div>
                      <div className="col-8">
                        {cat.weight ? `${cat.weight} kg` : 'Chưa cập nhật'}
                      </div>
                    </div>
                    
                    <div className="row mb-2">
                      <div className="col-4 text-muted">Ngày sinh:</div>
                      <div className="col-8">
                        {cat.birth_date 
                          ? format(new Date(cat.birth_date), 'dd/MM/yyyy', { locale: vi })
                          : 'Chưa cập nhật'
                        }
                      </div>
                    </div>
                  </div>

                  {cat.notes && (
                    <div className="mb-3">
                      <div className="text-muted mb-1">Ghi chú:</div>
                      <p className="mb-0 small">{cat.notes}</p>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditCat(cat)}
                    >
                      <FaEdit className="me-1" /> Sửa
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteCat(cat)}
                    >
                      <FaTrash className="me-1" /> Xóa
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5 bg-light rounded">
          <FaCat className="text-muted" size={50} />
          <h4 className="mt-3">Bạn chưa có mèo nào</h4>
          <p className="text-muted">Hãy thêm mèo cưng của bạn để đặt phòng và sử dụng dịch vụ</p>
          <Button variant="primary" onClick={handleAddCat}>
            <FaPlus className="me-2" /> Thêm mèo mới
          </Button>
        </div>
      )}

      {/* Modal thêm mèo mới */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm mèo mới</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: '',
            breed: '',
            weight: '',
            birth_date: '',
            gender: 'unknown',
            notes: ''
          }}
          validationSchema={catSchema}
          onSubmit={handleAddSubmit}
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
                  <Form.Label>Tên mèo <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                    placeholder="Nhập tên mèo"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Giống mèo</Form.Label>
                  <Form.Control
                    type="text"
                    name="breed"
                    value={values.breed}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.breed && errors.breed}
                    placeholder="Nhập giống mèo (nếu có)"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cân nặng (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        name="weight"
                        value={values.weight}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.weight && errors.weight}
                        placeholder="Nhập cân nặng"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.weight}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày sinh</Form.Label>
                      <Form.Control
                        type="date"
                        name="birth_date"
                        value={values.birth_date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.birth_date && errors.birth_date}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.birth_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.gender && errors.gender}
                  >
                    <option value="unknown">Không xác định</option>
                    <option value="male">Đực</option>
                    <option value="female">Cái</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.notes && errors.notes}
                    placeholder="Nhập ghi chú về mèo (nếu có)"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Thêm mèo'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal sửa thông tin mèo */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin mèo</Modal.Title>
        </Modal.Header>
        {currentCat && (
          <Formik
            initialValues={{
              name: currentCat.name || '',
              breed: currentCat.breed || '',
              weight: currentCat.weight || '',
              birth_date: currentCat.birth_date ? currentCat.birth_date.split('T')[0] : '',
              gender: currentCat.gender || 'unknown',
              notes: currentCat.notes || ''
            }}
            validationSchema={catSchema}
            onSubmit={handleEditSubmit}
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
                    <Form.Label>Tên mèo <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.name && errors.name}
                      placeholder="Nhập tên mèo"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Giống mèo</Form.Label>
                    <Form.Control
                      type="text"
                      name="breed"
                      value={values.breed}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.breed && errors.breed}
                      placeholder="Nhập giống mèo (nếu có)"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cân nặng (kg)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.1"
                          min="0"
                          name="weight"
                          value={values.weight}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.weight && errors.weight}
                          placeholder="Nhập cân nặng"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.weight}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control
                          type="date"
                          name="birth_date"
                          value={values.birth_date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.birth_date && errors.birth_date}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.birth_date}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Select
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.gender && errors.gender}
                    >
                      <option value="unknown">Không xác định</option>
                      <option value="male">Đực</option>
                      <option value="female">Cái</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.gender}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.notes && errors.notes}
                      placeholder="Nhập ghi chú về mèo (nếu có)"
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                    Hủy
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        )}
      </Modal>

      {/* Modal xác nhận xóa mèo */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCat && (
            <p>Bạn có chắc chắn muốn xóa mèo <strong>{currentCat.name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CatList;
