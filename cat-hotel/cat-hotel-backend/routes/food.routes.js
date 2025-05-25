// backend/routes/food.routes.js
const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/food.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Cấu hình multer upload
const upload = FoodController.uploadConfig();

// Routes công khai
router.get('/', FoodController.getFoods);
router.get('/:id', FoodController.getFoodById);

// Routes admin (yêu cầu quyền admin)
router.post('/', authenticateToken, isAdmin, upload.single('image'), FoodController.createFood);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), FoodController.updateFood);
router.delete('/:id', authenticateToken, isAdmin, FoodController.deleteFood);

module.exports = router;