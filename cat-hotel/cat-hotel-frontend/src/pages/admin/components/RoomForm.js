import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Schema validation cho form phòng
const roomSchema = Yup.object().shape({
  room_number: Yup.string()
    .required('Số phòng là bắt buộc')
    .max(10, 'Số phòng không được quá 10 ký tự'),
  room_type_id: Yup.number()
    .required('Loại phòng là bắt buộc'),
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['available', 'occupied', 'maintenance'], 'Trạng thái không hợp lệ')
});

const RoomForm = ({ room, roomTypes, onSubmit, onCancel }) => {
  // Khởi tạo giá trị mặc định
  const initialValues = {
    room_number: room ? room.room_number : '',
    room_type_id: room ? room.room_type_id : '',
    status: room ? room.status : 'available'
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={roomSchema}
      onSubmit={onSubmit}
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
              <Form.Label>Số phòng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="room_number"
                value={values.room_number}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.room_number && errors.room_number}
                placeholder="Nhập số phòng (VD: A101)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.room_number}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Số phòng phải là duy nhất trong hệ thống
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="room_type_id"
                value={values.room_type_id}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.room_type_id && errors.room_type_id}
              >
                <option value="">-- Chọn loại phòng --</option>
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {Number(type.price_per_day).toLocaleString()} VNĐ/ngày
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.room_type_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái <span className="text-danger">*</span></Form.Label>
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
            <Button variant="secondary" onClick={onCancel}>
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
                room ? 'Cập nhật' : 'Thêm phòng'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
};

export default RoomForm;