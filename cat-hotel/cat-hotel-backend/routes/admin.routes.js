const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const RoomController = require('../controllers/room.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes trong file này đều yêu cầu đăng nhập và quyền admin
router.use(authenticateToken, isAdmin);

// Quản lý người dùng
router.get('/users', AdminController.getUsers);

// Quản lý đơn đặt phòng
router.get('/bookings', AdminController.getBookings);
router.put('/bookings/:id/status', AdminController.updateBookingStatus);

// Quản lý trạng thái mèo
router.post('/bookings/:bookingId/cat-status', AdminController.updateCatStatus);

// Quản lý trạng thái phòng
router.put('/rooms/:id/status', RoomController.updateRoomStatus);

module.exports = router;
