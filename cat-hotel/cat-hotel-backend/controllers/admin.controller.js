const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const { Room } = require('../models/room.model');
const CatStatus = require('../models/cat-status.model');

class AdminController {
  // Lấy danh sách tất cả người dùng
  static async getUsers(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const users = await User.getAll(parseInt(limit), parseInt(offset));
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách người dùng'
      });
    }
  }

  // Lấy danh sách tất cả đơn đặt phòng
  static async getBookings(req, res) {
    try {
      const { limit = 100, offset = 0, status } = req.query;
      
      const bookings = await Booking.getAll(parseInt(limit), parseInt(offset));
      
      // Lọc theo trạng thái nếu có
      const filteredBookings = status 
        ? bookings.filter(booking => booking.status === status)
        : bookings;
      
      res.json({
        success: true,
        data: filteredBookings
      });
    } catch (error) {
      console.error('Admin get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách đơn đặt phòng'
      });
    }
  }

  // Cập nhật trạng thái đơn đặt phòng
  static async updateBookingStatus(req, res) {
    try {
      const bookingId = req.params.id;
      const { status } = req.body;
      
      // Kiểm tra trạng thái hợp lệ
      if (!['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }
      
      // Kiểm tra đơn đặt phòng tồn tại
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn đặt phòng'
        });
      }
      
      // Cập nhật trạng thái
      const updatedBooking = await Booking.updateStatus(bookingId, status);
      
      // Tự động cập nhật trạng thái phòng khi check-in hoặc check-out
      if (status === 'checked_in') {
        await Room.updateStatus(booking.room_id, 'occupied');
        
        // Tạo trạng thái mèo đầu tiên
        await CatStatus.create({
          booking_id: bookingId,
          status: 'checked_in',
          notes: 'Mèo đã được check-in vào khách sạn'
        });
      } else if (status === 'checked_out') {
        await Room.updateStatus(booking.room_id, 'maintenance');
        
        // Cập nhật trạng thái mèo
        await CatStatus.create({
          booking_id: bookingId,
          status: 'checked_out',
          notes: 'Mèo đã rời khách sạn'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn đặt phòng thành công',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Admin update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật trạng thái đơn đặt phòng'
      });
    }
  }

  // Cập nhật trạng thái của mèo
  static async updateCatStatus(req, res) {
    try {
      const bookingId = req.params.bookingId;
      const { status, notes } = req.body;
      
      // Kiểm tra trạng thái hợp lệ
      if (!['checked_in', 'in_care', 'resting', 'playing', 'eating', 'checked_out'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }
      
      // Kiểm tra đơn đặt phòng tồn tại
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn đặt phòng'
        });
      }
      
      // Kiểm tra đơn đặt phòng đã check-in chưa
      if (booking.status !== 'checked_in' && status !== 'checked_out') {
        return res.status(400).json({
          success: false,
          message: 'Đơn đặt phòng chưa check-in'
        });
      }
      
      // Tạo trạng thái mới
      const newStatus = await CatStatus.create({
        booking_id: bookingId,
        status,
        notes
      });
      
      // Nếu trạng thái là checked_out thì cập nhật trạng thái đơn đặt phòng
      if (status === 'checked_out') {
        await Booking.updateStatus(bookingId, 'checked_out');
        await Room.updateStatus(booking.room_id, 'maintenance');
      }
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái mèo thành công',
        data: newStatus
      });
    } catch (error) {
      console.error('Admin update cat status error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật trạng thái mèo'
      });
    }
  }
}

module.exports = AdminController;
