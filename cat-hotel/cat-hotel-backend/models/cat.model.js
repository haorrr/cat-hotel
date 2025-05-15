const { pool } = require('../config/db');

class Cat {
  // Tìm mèo theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cats WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách mèo theo user id
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM cats WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tạo mèo mới
  static async create(catData) {
    try {
      const { user_id, name, breed, weight, birth_date, gender, notes } = catData;
      const [result] = await pool.execute(
        'INSERT INTO cats (user_id, name, breed, weight, birth_date, gender, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, name, breed || null, weight || null, birth_date || null, gender || 'unknown', notes || null]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin mèo
  static async update(id, catData) {
    try {
      const { name, breed, weight, birth_date, gender, notes } = catData;
      const [result] = await pool.execute(
        'UPDATE cats SET name = ?, breed = ?, weight = ?, birth_date = ?, gender = ?, notes = ? WHERE id = ?',
        [name, breed || null, weight || null, birth_date || null, gender || 'unknown', notes || null, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa mèo
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM cats WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra quyền sở hữu (kiểm tra mèo có thuộc về user không)
  static async belongsToUser(catId, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cats WHERE id = ? AND user_id = ?',
        [catId, userId]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cat;
