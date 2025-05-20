import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCat, FaMoneyBillWave } from 'react-icons/fa';

const RoomTypeCard = ({ roomType, onEdit, onDelete }) => {
  return (
    <Card className="h-100 shadow-sm">
      <div className="room-type-image-container" style={{ height: '200px', overflow: 'hidden' }}>
        {roomType.image_url ? (
          <Card.Img 
            variant="top" 
            src={roomType.image_url} 
            alt={roomType.name}
            style={{ height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = `https://cdn3.ivivu.com/2014/01/SUPER-DELUXE2.jpg`;
            }}
          />
        ) : (
          <div 
            className="d-flex flex-column justify-content-center align-items-center bg-light"
            style={{ height: '100%' }}
          >
            <span className="text-muted mb-2">Chưa có hình ảnh</span>
            <small className="text-muted">Vui lòng tải lên hình ảnh</small>
          </div>
        )}
      </div>
      
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title>{roomType.name}</Card.Title>
          <Badge bg="info">
            <FaCat className="me-1" /> {roomType.capacity} mèo
          </Badge>
        </div>
        
        <Card.Text className="text-muted small" style={{ minHeight: '60px' }}>
          {roomType.description || 'Không có mô tả.'}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="price">
            <FaMoneyBillWave className="text-success me-1" />
            <span className="fw-bold">{Number(roomType.price_per_day).toLocaleString()} VNĐ</span>
            <small className="text-muted"> / ngày</small>
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-white">
        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={onEdit}
          >
            <FaEdit className="me-1" /> Sửa
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={onDelete}
          >
            <FaTrash className="me-1" /> Xóa
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default RoomTypeCard;