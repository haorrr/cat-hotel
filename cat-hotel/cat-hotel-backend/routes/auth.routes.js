const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRequest, registerValidation, loginValidation } = require('../middlewares/validation.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Đăng ký tài khoản mới
router.post('/register', registerValidation, validateRequest, AuthController.register);

// Đăng nhập
router.post('/login', loginValidation, validateRequest, AuthController.login);

// Lấy thông tin profile (yêu cầu đăng nhập)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Cập nhật thông tin profile (yêu cầu đăng nhập)
router.put('/profile', authenticateToken, AuthController.updateProfile);

// Đổi mật khẩu (yêu cầu đăng nhập)
router.put('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;
