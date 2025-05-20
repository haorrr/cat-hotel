import React from 'react';
import { Badge } from 'react-bootstrap';

const BookingStatusBadge = ({ status, size = 'md' }) => {
  const getVariant = () => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'checked_in':
        return 'success';
      case 'checked_out':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getText = () => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'checked_in':
        return 'Đã nhận phòng';
      case 'checked_out':
        return 'Đã trả phòng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const className = size === 'lg' ? 'py-2 px-3' : '';

  return (
    <Badge bg={getVariant()} className={className}>
      {getText()}
    </Badge>
  );
};

export default BookingStatusBadge;