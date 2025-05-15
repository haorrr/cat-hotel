const { pool } = require('../config/db');

class Room {
  // Lấy thông tin phòng theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT r.*, rt.name as room_type_name, rt.description, rt.price_per_day, rt.capacity, rt.image_url
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        WHERE r.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách tất cả phòng
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT r.*, rt.name as room_type_name, rt.description, rt.price_per_day, rt.capacity, rt.image_url
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        ORDER BY r.room_number
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Lấy danh sách phòng trống trong khoảng thời gian
  static async getAvailable(checkInDate, checkOutDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT r.*, rt.name as room_type_name, rt.description, rt.price_per_day, rt.capacity, rt.image_url
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        WHERE r.status = 'available'
        AND r.id NOT IN (
          SELECT b.room_id 
          FROM bookings b 
          WHERE b.status IN ('pending', 'confirmed', 'checked_in')
          AND (
            (b.check_in_date <= ? AND b.check_out_date > ?) OR
            (b.check_in_date < ? AND b.check_out_date >= ?) OR
            (b.check_in_date >= ? AND b.check_out_date <= ?)
          )
        )
        ORDER BY rt.price_per_day
      `, [checkOutDate, checkInDate, checkOutDate, checkInDate, checkInDate, checkOutDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái phòng
  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE rooms SET status = ? WHERE id = ?',
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
}

class RoomType {
  // Lấy tất cả loại phòng
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM room_types ORDER BY price_per_day'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin loại phòng theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM room_types WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  Room,
  RoomType
};
