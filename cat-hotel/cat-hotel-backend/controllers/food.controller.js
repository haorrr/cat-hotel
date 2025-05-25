// backend/controllers/food.controller.js
const Food = require('../models/food.model');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

class FoodController {
  // Lấy danh sách tất cả thức ăn
  static async getFoods(req, res) {
    try {
      const foods = await Food.getAll();
      
      res.json({
        success: true,
        data: foods
      });
    } catch (error) {
      console.error('Get foods error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách thức ăn'
      });
    }
  }

  // Lấy thông tin chi tiết thức ăn
  static async getFoodById(req, res) {
    try {
      const foodId = req.params.id;
      
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thức ăn'
        });
      }
      
      res.json({
        success: true,
        data: food
      });
    } catch (error) {
      console.error('Get food by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin thức ăn'
      });
    }
  }

  // Cấu hình multer để upload ảnh
  static uploadConfig() {
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/foods');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'food-' + uniqueSuffix + ext);
      }
    });
    
    const fileFilter = (req, file, cb) => {
      // Chỉ chấp nhận các file ảnh
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file ảnh'), false);
      }
    };
    
    return multer({ 
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
      }
    });
  }

  // Thêm thức ăn mới (admin)
  static async createFood(req, res) {
    try {
      const { name, description, price } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Tên và giá thức ăn là bắt buộc'
        });
      }
      
      // Xử lý hình ảnh nếu có
      let image_url = null;
      if (req.file) {
        image_url = '/images/foods/' + req.file.filename;
      }
      
      const newFood = await Food.create({
        name,
        description,
        price,
        image_url
      });
      
      if (!newFood) {
        return res.status(400).json({
          success: false,
          message: 'Không thể tạo thức ăn mới'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Thêm thức ăn thành công',
        data: newFood
      });
    } catch (error) {
      console.error('Create food error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm thức ăn'
      });
    }
  }

  // Cập nhật thông tin thức ăn (admin)
  static async updateFood(req, res) {
    try {
      const foodId = req.params.id;
      const { name, description, price } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Tên và giá thức ăn là bắt buộc'
        });
      }
      
      // Kiểm tra thức ăn có tồn tại không
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thức ăn'
        });
      }
      
      // Xử lý hình ảnh nếu có
      let image_url = food.image_url;
      if (req.file) {
        // Xóa ảnh cũ nếu có
        if (food.image_url) {
          const oldImagePath = path.join(__dirname, '../../public', food.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        image_url = '/images/foods/' + req.file.filename;
      }
      
      const updatedFood = await Food.update(foodId, {
        name,
        description,
        price,
        image_url
      });
      
      if (!updatedFood) {
        return res.status(400).json({
          success: false,
          message: 'Không thể cập nhật thông tin thức ăn'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin thức ăn thành công',
        data: updatedFood
      });
    } catch (error) {
      console.error('Update food error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin thức ăn'
      });
    }
  }

  // Xóa thức ăn (admin)
  static async deleteFood(req, res) {
    try {
      const foodId = req.params.id;
      
      // Kiểm tra thức ăn có tồn tại không
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thức ăn'
        });
      }
      
      // Kiểm tra thức ăn có đang được sử dụng không
      const isInUse = await Food.isInUse(foodId);
      if (isInUse) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa thức ăn đang được sử dụng'
        });
      }
      
      // Xóa ảnh nếu có
      if (food.image_url) {
        const imagePath = path.join(__dirname, '../../public', food.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      const deleted = await Food.delete(foodId);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa thức ăn'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa thức ăn thành công'
      });
    } catch (error) {
      console.error('Delete food error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa thức ăn'
      });
    }
  }
}

module.exports = FoodController;