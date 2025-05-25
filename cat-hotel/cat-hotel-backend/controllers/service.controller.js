// backend/controllers/service.controller.js
const Service = require('../models/service.model');

class ServiceController {
  // Lấy danh sách tất cả dịch vụ
  static async getServices(req, res) {
    try {
      const services = await Service.getAll();
      
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách dịch vụ'
      });
    }
  }

  // Lấy thông tin chi tiết dịch vụ
  static async getServiceById(req, res) {
    try {
      const serviceId = req.params.id;
      
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ'
        });
      }
      
      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Get service by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin dịch vụ'
      });
    }
  }

  // Thêm dịch vụ mới (admin)
  static async createService(req, res) {
    try {
      const { name, description, price } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Tên và giá dịch vụ là bắt buộc'
        });
      }
      
      const newService = await Service.create({
        name,
        description,
        price
      });
      
      if (!newService) {
        return res.status(400).json({
          success: false,
          message: 'Không thể tạo dịch vụ mới'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Thêm dịch vụ thành công',
        data: newService
      });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm dịch vụ'
      });
    }
  }

  // Cập nhật thông tin dịch vụ (admin)
  static async updateService(req, res) {
    try {
      const serviceId = req.params.id;
      const { name, description, price } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Tên và giá dịch vụ là bắt buộc'
        });
      }
      
      // Kiểm tra dịch vụ có tồn tại không
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ'
        });
      }
      
      const updatedService = await Service.update(serviceId, {
        name,
        description,
        price
      });
      
      if (!updatedService) {
        return res.status(400).json({
          success: false,
          message: 'Không thể cập nhật thông tin dịch vụ'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin dịch vụ thành công',
        data: updatedService
      });
    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin dịch vụ'
      });
    }
  }

  // Xóa dịch vụ (admin)
  static async deleteService(req, res) {
    try {
      const serviceId = req.params.id;
      
      // Kiểm tra dịch vụ có tồn tại không
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ'
        });
      }
      
      // Kiểm tra dịch vụ có đang được sử dụng không
      const isInUse = await Service.isInUse(serviceId);
      if (isInUse) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa dịch vụ đang được sử dụng'
        });
      }
      
      const deleted = await Service.delete(serviceId);
      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa dịch vụ'
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa dịch vụ thành công'
      });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa dịch vụ'
      });
    }
  }
}

module.exports = ServiceController;