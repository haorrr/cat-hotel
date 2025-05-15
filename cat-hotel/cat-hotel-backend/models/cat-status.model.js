const { pool } = require('../config/db');

class CatStatus {
  // Tìm trạng thái mèo theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cat_statuses WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch sử trạng thái mèo theo booking id
  static async findByBookingId(bookingId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cat_statuses WHERE booking_id = ? ORDER BY created_at DESC',
        [bookingId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy trạng thái hiện tại của mèo theo booking id
  static async getCurrentByBookingId(bookingId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cat_statuses WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1',
        [bookingId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Tạo trạng thái mới
  static async create(statusData) {
    try {
      const { booking_id, status, notes } = statusData;
      
      const [result] = await pool.execute(
        'INSERT INTO cat_statuses (booking_id, status, notes) VALUES (?, ?, ?)',
        [booking_id, status, notes || null]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CatStatus;
