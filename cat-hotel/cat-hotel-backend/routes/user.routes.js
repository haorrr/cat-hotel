const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Tất cả routes trong file này đều yêu cầu đăng nhập
router.use(authenticateToken);

// Lấy thông tin profile
router.get('/profile', AuthController.getProfile);

// Cập nhật thông tin profile
router.put('/profile', AuthController.updateProfile);

// Đổi mật khẩu
router.put('/change-password', AuthController.changePassword);

module.exports = router;
