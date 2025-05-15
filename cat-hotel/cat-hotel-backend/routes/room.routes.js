const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/room.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Lấy danh sách tất cả phòng
router.get('/', RoomController.getRooms);

// Lấy danh sách phòng trống trong khoảng thời gian
router.get('/available', RoomController.getAvailableRooms);

// Lấy danh sách loại phòng
router.get('/types', RoomController.getRoomTypes);

// Lấy thông tin chi tiết phòng
router.get('/:id', RoomController.getRoomById);

module.exports = router;
