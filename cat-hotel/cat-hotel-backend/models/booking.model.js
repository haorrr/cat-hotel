// backend/models/booking.model.js
const { pool } = require('../config/db');

class Booking {
  // Tìm booking theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT b.*, r.room_number, rt.name as room_type, rt.price_per_day,
               c.name as cat_name, c.breed as cat_breed, u.name as user_name, u.email as user_email
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN room_types rt ON r.room_type_id = rt.id
        JOIN cats c ON b.cat_id = c.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách booking theo user id
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT b.*, r.room_number, rt.name as room_type, rt.price_per_day,
               c.name as cat_name, c.breed as cat_breed
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN room_types rt ON r.room_type_id = rt.id
        JOIN cats c ON b.cat_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tạo booking mới
  static async create(bookingData) {
    try {
      const { user_id, room_id, cat_id, check_in_date, check_out_date, total_price, special_requests } = bookingData;
      
      const [result] = await pool.execute(
        `INSERT INTO bookings 
          (user_id, room_id, cat_id, check_in_date, check_out_date, total_price, special_requests, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [user_id, room_id, cat_id, check_in_date, check_out_date, total_price, special_requests || null]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái booking
  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Hủy booking
  static async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }

  // Lấy tất cả booking (dành cho admin)
  static async getAll(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.execute(`
        SELECT b.*, r.room_number, rt.name as room_type,
               c.name as cat_name, c.breed as cat_breed, 
               u.name as user_name, u.email as user_email
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN room_types rt ON r.room_type_id = rt.id
        JOIN cats c ON b.cat_id = c.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra phòng có sẵn sàng để đặt không
  static async isRoomAvailable(roomId, checkInDate, checkOutDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE room_id = ? 
        AND status IN ('pending', 'confirmed', 'checked_in')
        AND (
          (check_in_date <= ? AND check_out_date > ?) OR
          (check_in_date < ? AND check_out_date >= ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      `, [roomId, checkOutDate, checkInDate, checkOutDate, checkInDate, checkInDate, checkOutDate]);
      
      // Nếu count = 0 thì phòng có sẵn
      return rows[0].count === 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra quyền sở hữu (kiểm tra booking có thuộc về user không)
  static async belongsToUser(bookingId, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE id = ? AND user_id = ?',
        [bookingId, userId]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Booking;
