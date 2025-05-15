const Booking = require('../models/booking.model');
const { Room } = require('../models/room.model');
const Cat = require('../models/cat.model');
const CatStatus = require('../models/cat-status.model');

class BookingController {
  // Lấy danh sách đặt phòng của user
  static async getBookings(req, res) {
    try {
      const userId = req.user.id;
      
      const bookings = await Booking.findByUserId(userId);
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách đặt phòng'
      });
    }
  }

  // Lấy thông tin chi tiết đặt phòng
  static async getBookingById(req, res) {
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;
      
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn đặt phòng'
        });
      }
      
      // Kiểm tra quyền truy cập nếu không phải admin
      if (req.user.role !== 'admin' && booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập thông tin này'
        });
      }
      
      // Lấy lịch sử trạng thái của mèo
      const catStatuses = await CatStatus.findByBookingId(bookingId);
      
      res.json({
        success: true,
        data: {
          booking,
          catStatuses
        }
      });
    } catch (error) {
      console.error('Get booking by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin đặt phòng'
      });
    }
  }

  // Tạo đặt phòng mới
  static async createBooking(req, res) {
    try {
      const userId = req.user.id;
      const { room_id, cat_id, check_in_date, check_out_date, special_requests } = req.body;
      
      // Kiểm tra mèo có thuộc về user không
      const isCatOwner = await Cat.belongsToUser(cat_id, userId);
      if (!isCatOwner) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không sở hữu mèo này'
        });
      }
      
      // Kiểm tra phòng có tồn tại và có sẵn không
      const room = await Room.findById(room_id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      if (room.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Phòng hiện không khả dụng'
        });
      }
      
      // Kiểm tra phòng có trống trong khoảng thời gian đó không
      const isAvailable = await Booking.isRoomAvailable(room_id, check_in_date, check_out_date);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Phòng đã được đặt trong khoảng thời gian này'
        });
      }
      
      // Tính tổng tiền
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const total_price = room.price_per_day * days;
      
      // Tạo đặt phòng mới
      const newBooking = await Booking.create({
        user_id: userId,
        room_id,
        cat_id,
        check_in_date,
        check_out_date,
        total_price,
        special_requests
      });
      
      res.status(201).json({
        success: true,
        message: 'Đặt phòng thành công',
        data: newBooking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi đặt phòng'
      });
    }
  }

  // Hủy đặt phòng
  static async cancelBooking(req, res) {
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;
      
      // Kiểm tra đặt phòng có tồn tại không
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn đặt phòng'
        });
      }
      
      // Kiểm tra quyền hủy nếu không phải admin
      if (req.user.role !== 'admin' && booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền hủy đơn đặt phòng này'
        });
      }
      
      // Kiểm tra trạng thái đặt phòng
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đơn đặt phòng trong trạng thái này'
        });
      }
      
      // Hủy đặt phòng
      const updatedBooking = await Booking.cancel(bookingId);
      
      res.json({
        success: true,
        message: 'Hủy đơn đặt phòng thành công',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi hủy đơn đặt phòng'
      });
    }
  }
}

module.exports = BookingController;
