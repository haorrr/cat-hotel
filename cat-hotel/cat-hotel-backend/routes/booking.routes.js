const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateRequest, bookingValidation } = require('../middlewares/validation.middleware');

// Tất cả routes trong file này đều yêu cầu đăng nhập
router.use(authenticateToken);

// Lấy danh sách đặt phòng của user
router.get('/', BookingController.getBookings);

// Đặt phòng mới
router.post('/', bookingValidation, validateRequest, BookingController.createBooking);

// Lấy thông tin chi tiết đặt phòng
router.get('/:id', BookingController.getBookingById);

// Hủy đặt phòng
router.put('/:id/cancel', BookingController.cancelBooking);

module.exports = router;
