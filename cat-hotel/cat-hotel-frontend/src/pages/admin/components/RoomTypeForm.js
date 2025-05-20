import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Row, Col, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaUpload, FaImage } from 'react-icons/fa';
import roomService from '../../../api/roomService';

// Schema validation cho form loại phòng
const roomTypeSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên loại phòng là bắt buộc')
    .max(100, 'Tên loại phòng không được quá 100 ký tự'),
  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),
  price_per_day: Yup.number()
    .required('Giá phòng là bắt buộc')
    .positive('Giá phòng phải là số dương'),
  capacity: Yup.number()
    .required('Sức chứa là bắt buộc')
    .positive('Sức chứa phải là số dương')
    .integer('Sức chứa phải là số nguyên')
});

const RoomTypeForm = ({ roomType, onSubmit, onCancel }) => {
  const [previewImage, setPreviewImage] = useState(roomType?.image_url || '');
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Khởi tạo giá trị mặc định
  const initialValues = {
    name: roomType ? roomType.name : '',
    description: roomType ? roomType.description : '',
    price_per_day: roomType ? roomType.price_per_day : '',
    capacity: roomType ? roomType.capacity : 1,
    image_url: roomType ? roomType.image_url : ''
  };

  // Xử lý khi chọn file ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
      return;
    }

    // Kiểm tra kích thước file (tối đa 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 2MB');
      return;
    }

    setImageFile(file);
    setUploadError('');

    // Tạo preview cho ảnh
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý upload ảnh
  const handleUploadImage = async (roomTypeId) => {
    if (!imageFile || !roomTypeId) return null;

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await roomService.uploadRoomImage(roomTypeId, formData);
      setUploadSuccess('Tải lên ảnh thành công!');
      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Không thể tải lên ảnh. Vui lòng thử lại sau.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Sao chép giá trị từ form
    const roomTypeData = { ...values };
    let needImageUpload = false;

    // Nếu đã có ID (là cập nhật) và có file ảnh mới
    if (roomType?.id && imageFile) {
      const imageUrl = await handleUploadImage(roomType.id);
      if (imageUrl) {
        roomTypeData.image_url = imageUrl;
      }
    } else if (imageFile && !roomType?.id) {
      // Nếu là thêm mới và có file ảnh, đánh dấu để upload sau
      needImageUpload = true;
    }

    try {
      // Gọi hàm onSubmit từ component cha để lưu loại phòng
      const result = await onSubmit(roomTypeData, { setSubmitting, resetForm });
      
      // Nếu cần upload ảnh cho loại phòng mới (kết quả trả về có id của loại phòng mới)
      if (needImageUpload && result && result.id) {
        const imageUrl = await handleUploadImage(result.id);
        if (imageUrl) {
          // Cập nhật URL ảnh cho loại phòng vừa tạo
          await roomService.updateRoomType(result.id, { image_url: imageUrl });
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={roomTypeSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        setFieldValue
      }) => (
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên loại phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                    placeholder="Nhập tên loại phòng"
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
                    placeholder="Nhập mô tả về loại phòng"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá phòng (VNĐ/ngày) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="price_per_day"
                        value={values.price_per_day}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.price_per_day && errors.price_per_day}
                        placeholder="Nhập giá phòng"
                        min="0"
                        step="10000"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price_per_day}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sức chứa (mèo) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="capacity"
                        value={values.capacity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.capacity && errors.capacity}
                        placeholder="Nhập sức chứa"
                        min="1"
                        max="10"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.capacity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              
              <Col md={5}>
                <Card className="mb-3">
                  <Card.Body>
                    <h6 className="mb-3">Hình ảnh loại phòng</h6>
                    
                    <div className="image-preview-container mb-3 text-center">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Room type preview" 
                          className="img-thumbnail" 
                          style={{ maxHeight: '200px', maxWidth: '100%' }}
                        />
                      ) : (
                        <div className="no-image-placeholder p-5 bg-light rounded text-center">
                          <FaImage size={50} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Chưa có hình ảnh</p>
                        </div>
                      )}
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Tải lên ảnh</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleImageChange}
                      />
                      <Form.Text className="text-muted">
                        Hỗ trợ định dạng JPG, PNG, GIF. Kích thước tối đa 2MB.
                      </Form.Text>
                    </Form.Group>
                    
                    {uploadError && (
                      <Alert variant="danger" className="mt-2">
                        {uploadError}
                      </Alert>
                    )}
                    
                    {uploadSuccess && (
                      <Alert variant="success" className="mt-2">
                        {uploadSuccess}
                      </Alert>
                    )}
                    
                    {roomType && !imageFile && (
                      <Form.Text className="text-muted mt-2 d-block">
                        {values.image_url 
                          ? 'Giữ nguyên ảnh hiện tại hoặc tải lên ảnh mới để thay thế.' 
                          : 'Tải lên ảnh sau khi đã tạo loại phòng.'}
                      </Form.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onCancel}>
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
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
                roomType ? 'Cập nhật' : 'Thêm loại phòng'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
};

export default RoomTypeForm;