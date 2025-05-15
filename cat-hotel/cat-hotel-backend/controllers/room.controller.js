const { Room, RoomType } = require('../models/room.model');

class RoomController {
  // Lấy danh sách tất cả phòng
  static async getRooms(req, res) {
    try {
      const rooms = await Room.getAll();
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách phòng'
      });
    }
  }

  // Lấy thông tin chi tiết phòng
  static async getRoomById(req, res) {
    try {
      const roomId = req.params.id;
      
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Get room by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin phòng'
      });
    }
  }

  // Lấy danh sách phòng trống trong khoảng thời gian
  static async getAvailableRooms(req, res) {
    try {
      const { check_in_date, check_out_date } = req.query;
      
      if (!check_in_date || !check_out_date) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ngày nhận và trả phòng'
        });
      }
      
      // Kiểm tra ngày hợp lệ
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày không hợp lệ'
        });
      }
      
      if (checkIn >= checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Ngày trả phòng phải sau ngày nhận phòng'
        });
      }
      
      const rooms = await Room.getAvailable(check_in_date, check_out_date);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Get available rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách phòng trống'
      });
    }
  }

  // Lấy tất cả loại phòng
  static async getRoomTypes(req, res) {
    try {
      const roomTypes = await RoomType.getAll();
      
      res.json({
        success: true,
        data: roomTypes
      });
    } catch (error) {
      console.error('Get room types error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách loại phòng'
      });
    }
  }

  // Cập nhật trạng thái phòng (chỉ dành cho admin)
  static async updateRoomStatus(req, res) {
    try {
      const roomId = req.params.id;
      const { status } = req.body;
      
      if (!['available', 'occupied', 'maintenance'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái phòng không hợp lệ'
        });
      }
      
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      const updatedRoom = await Room.updateStatus(roomId, status);
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái phòng thành công',
        data: updatedRoom
      });
    } catch (error) {
      console.error('Update room status error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật trạng thái phòng'
      });
    }
  }
}

module.exports = RoomController;
