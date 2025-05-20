const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/room.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Cấu hình multer upload
const upload = RoomController.uploadConfig();

// Tất cả routes trong file này đều yêu cầu đăng nhập và quyền admin
router.use(authenticateToken, isAdmin);

// Quản lý phòng
router.post('/rooms', RoomController.createRoom);
router.put('/rooms/:id', RoomController.updateRoom);
router.delete('/rooms/:id', RoomController.deleteRoom);

// Quản lý loại phòng
router.post('/room-types', RoomController.createRoomType);
router.put('/room-types/:id', RoomController.updateRoomType);
router.delete('/room-types/:id', RoomController.deleteRoomType);

// Quản lý hình ảnh phòng
router.post('/room-types/:id/image', upload.single('image'), RoomController.uploadRoomTypeImage);
router.get('/room-types/:id/images', RoomController.getRoomTypeImages);
router.delete('/room-images/:id', RoomController.deleteRoomTypeImage);
router.put('/room-images/:id/set-primary', RoomController.setPrimaryRoomTypeImage);

module.exports = router;