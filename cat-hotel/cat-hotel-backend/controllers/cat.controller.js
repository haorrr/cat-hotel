const Cat = require('../models/cat.model');

class CatController {
  // Lấy danh sách mèo của user
  static async getCats(req, res) {
    try {
      const userId = req.user.id;
      
      const cats = await Cat.findByUserId(userId);
      
      res.json({
        success: true,
        data: cats
      });
    } catch (error) {
      console.error('Get cats error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách mèo'
      });
    }
  }

  // Lấy thông tin chi tiết của một mèo
  static async getCatById(req, res) {
    try {
      const catId = req.params.id;
      const userId = req.user.id;
      
      // Kiểm tra mèo có tồn tại không
      const cat = await Cat.findById(catId);
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy mèo'
        });
      }
      
      // Kiểm tra quyền sở hữu nếu không phải admin
      if (req.user.role !== 'admin' && cat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập thông tin này'
        });
      }

      res.json({
        success: true,
        data: cat
      });
    } catch (error) {
      console.error('Get cat by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin mèo'
      });
    }
  }

  // Thêm mèo mới
  static async createCat(req, res) {
    try {
      const userId = req.user.id;
      const { name, breed, weight, birth_date, gender, notes } = req.body;
      
      const newCat = await Cat.create({
        user_id: userId,
        name,
        breed,
        weight,
        birth_date,
        gender,
        notes
      });
      
      if (!newCat) {
        return res.status(400).json({
          success: false,
          message: 'Không thể tạo thông tin mèo'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Thêm mèo thành công',
        data: newCat
      });
    } catch (error) {
      console.error('Create cat error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm mèo'
      });
    }
  }

  // Cập nhật thông tin mèo
  static async updateCat(req, res) {
    try {
      const catId = req.params.id;
      const userId = req.user.id;
      const { name, breed, weight, birth_date, gender, notes } = req.body;
      
      // Kiểm tra mèo có tồn tại không
      const cat = await Cat.findById(catId);
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy mèo'
        });
      }
      
      // Kiểm tra quyền sở hữu nếu không phải admin
      if (req.user.role !== 'admin' && cat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa thông tin này'
        });
      }
      
      const updatedCat = await Cat.update(catId, {
        name,
        breed,
        weight,
        birth_date,
        gender,
        notes
      });
      
      if (!updatedCat) {
        return res.status(400).json({
          success: false,
          message: 'Không thể cập nhật thông tin mèo'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin mèo thành công',
        data: updatedCat
      });
    } catch (error) {
      console.error('Update cat error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin mèo'
      });
    }
  }

  // Xóa mèo
  static async deleteCat(req, res) {
    try {
      const catId = req.params.id;
      const userId = req.user.id;
      
      // Kiểm tra mèo có tồn tại không
      const cat = await Cat.findById(catId);
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy mèo'
        });
      }
      
      // Kiểm tra quyền sở hữu nếu không phải admin
      if (req.user.role !== 'admin' && cat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa thông tin này'
        });
      }
      
      const deleted = await Cat.delete(catId);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa thông tin mèo'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa mèo thành công'
      });
    } catch (error) {
      console.error('Delete cat error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa mèo'
      });
    }
  }
}

module.exports = CatController;
