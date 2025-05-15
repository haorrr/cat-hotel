const express = require('express');
const router = express.Router();
const CatController = require('../controllers/cat.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateRequest, catValidation } = require('../middlewares/validation.middleware');

// Tất cả routes trong file này đều yêu cầu đăng nhập
router.use(authenticateToken);

// Lấy danh sách mèo của user
router.get('/', CatController.getCats);

// Thêm mèo mới
router.post('/', catValidation, validateRequest, CatController.createCat);

// Lấy thông tin chi tiết mèo
router.get('/:id', CatController.getCatById);

// Cập nhật thông tin mèo
router.put('/:id', catValidation, validateRequest, CatController.updateCat);

// Xóa mèo
router.delete('/:id', CatController.deleteCat);

module.exports = router;
