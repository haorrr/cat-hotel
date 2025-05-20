const { pool } = require('../config/db');

class RoomImage {
  // Lấy tất cả hình ảnh của loại phòng
  static async getByRoomTypeId(roomTypeId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY is_primary DESC, id ASC',
        [roomTypeId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy ảnh chính của loại phòng
  static async getPrimaryByRoomTypeId(roomTypeId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM room_images WHERE room_type_id = ? AND is_primary = 1 LIMIT 1',
        [roomTypeId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Thêm ảnh mới
  static async create(imageData) {
    try {
      const { room_type_id, image_url, is_primary } = imageData;
      
      // Nếu là ảnh chính, cập nhật tất cả ảnh khác thành không phải ảnh chính
      if (is_primary) {
        await pool.execute(
          'UPDATE room_images SET is_primary = 0 WHERE room_type_id = ?',
          [room_type_id]
        );
      }
      
      const [result] = await pool.execute(
        'INSERT INTO room_images (room_type_id, image_url, is_primary) VALUES (?, ?, ?)',
        [room_type_id, image_url, is_primary || 0]
      );
      
      if (result.insertId) {
        const [rows] = await pool.execute(
          'SELECT * FROM room_images WHERE id = ?',
          [result.insertId]
        );
        return rows[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa ảnh
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM room_images WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Đặt ảnh làm ảnh chính
  static async setPrimary(id, roomTypeId) {
    try {
      // Cập nhật tất cả ảnh khác thành không phải ảnh chính
      await pool.execute(
        'UPDATE room_images SET is_primary = 0 WHERE room_type_id = ?',
        [roomTypeId]
      );
      
      // Đặt ảnh này làm ảnh chính
      const [result] = await pool.execute(
        'UPDATE room_images SET is_primary = 1 WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa tất cả ảnh của loại phòng
  static async deleteByRoomTypeId(roomTypeId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM room_images WHERE room_type_id = ?',
        [roomTypeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoomImage;