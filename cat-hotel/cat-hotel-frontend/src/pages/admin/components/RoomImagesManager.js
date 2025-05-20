import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaImage, FaTrash, FaStar, FaCloudUploadAlt } from 'react-icons/fa';
import roomService from '../../../api/roomService';

const RoomImagesManager = ({ roomTypeId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  // Fetch images
  const fetchImages = async () => {
    if (!roomTypeId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await roomService.getRoomTypeImages(roomTypeId);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching room images:', error);
      setError('Không thể tải danh sách hình ảnh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [roomTypeId]);

  // Reset message after delay
  const resetMessage = (setter) => {
    setTimeout(() => {
      setter('');
    }, 3000);
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 2MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleUploadImage = async () => {
    if (!imageFile || !roomTypeId) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('is_primary', isPrimary ? '1' : '0');

      await roomService.uploadRoomTypeImage(roomTypeId, formData);
      
      setSuccess('Tải lên ảnh thành công!');
      resetMessage(setSuccess);
      
      // Reset form and close modal
      setImageFile(null);
      setPreviewImage('');
      setIsPrimary(false);
      setShowUploadModal(false);
      
      // Refresh images
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Không thể tải lên ảnh. Vui lòng thử lại sau.');
      resetMessage(setError);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      
      await roomService.deleteRoomTypeImage(selectedImage.id);
      
      setSuccess('Xóa ảnh thành công!');
      resetMessage(setSuccess);
      
      // Close modal and refresh images
      setShowDeleteModal(false);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Không thể xóa ảnh. Vui lòng thử lại sau.');
      resetMessage(setError);
    } finally {
      setLoading(false);
    }
  };

  // Handle set primary image
  const handleSetPrimary = async (image) => {
    if (!image) return;

    try {
      setLoading(true);
      
      await roomService.setPrimaryRoomTypeImage(image.id, roomTypeId);
      
      setSuccess('Đặt ảnh chính thành công!');
      resetMessage(setSuccess);
      
      // Refresh images
      fetchImages();
    } catch (error) {
      console.error('Error setting primary image:', error);
      setError('Không thể đặt ảnh chính. Vui lòng thử lại sau.');
      resetMessage(setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-images-manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Quản lý hình ảnh</h5>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setShowUploadModal(true)}
        >
          <FaCloudUploadAlt className="me-1" /> Tải lên ảnh mới
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-3">
          {success}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="mb-0 mt-2">Đang tải...</p>
        </div>
      ) : (
        <Row>
          {images.length > 0 ? (
            images.map((image) => (
              <Col xs={6} md={4} lg={3} key={image.id} className="mb-3">
                <Card className="h-100">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={image.image_url}
                      style={{ height: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg";
                      }}
                    />
                    {image.is_primary && (
                      <div 
                        className="position-absolute top-0 start-0 m-2 p-1 bg-warning rounded-circle"
                        title="Ảnh chính"
                      >
                        <FaStar className="text-white" />
                      </div>
                    )}
                  </div>
                  <Card.Body className="p-2">
                    <div className="btn-group w-100">
                      {!image.is_primary && (
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleSetPrimary(image)}
                          title="Đặt làm ảnh chính"
                        >
                          <FaStar />
                        </Button>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          setSelectedImage(image);
                          setShowDeleteModal(true);
                        }}
                        title="Xóa ảnh"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-4 bg-light rounded">
                <FaImage className="text-muted mb-2" size={30} />
                <p className="mb-0">Chưa có hình ảnh nào</p>
              </div>
            </Col>
          )}
        </Row>
      )}
      
      {/* Upload Image Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tải lên hình ảnh mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Chọn hình ảnh</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Hỗ trợ định dạng JPG, PNG, GIF. Kích thước tối đa 2MB.
              </Form.Text>
            </Form.Group>
            
            {previewImage && (
              <div className="mb-3 text-center">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="img-thumbnail"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Đặt làm ảnh chính"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadImage}
            disabled={!imageFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang tải lên...
              </>
            ) : (
              'Tải lên'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Image Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa hình ảnh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa hình ảnh này?</p>
          {selectedImage && (
            <div className="text-center">
              <img 
                src={selectedImage.image_url} 
                alt="Delete Preview" 
                className="img-thumbnail"
                style={{ maxHeight: '200px' }}
                onError={(e) => {
                  e.target.src = "https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg";
                }}
              />
              {selectedImage.is_primary && (
                <div className="alert alert-warning mt-2">
                  <small>
                    <strong>Lưu ý:</strong> Đây là ảnh chính hiện tại. Xóa ảnh này sẽ cần chọn ảnh chính mới.
                  </small>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteImage}
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa ảnh'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoomImagesManager;