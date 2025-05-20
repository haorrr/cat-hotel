const { pool } = require('../config/db');

class User {
  // Tìm user theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tìm user theo email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo user mới
  static async create(userData) {
    try {
      const { name, email, password, phone } = userData;
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [name, email, password, phone]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin user
  static async update(id, userData) {
    try {
      const { name, phone } = userData;
      const [result] = await pool.execute(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [name, phone, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật mật khẩu
  static async updatePassword(id, password) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [password, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách users (chỉ dành cho admin)
static async getAll(limit = 100, offset = 0) {
  try {
    // Chuyển sang sử dụng query thay vì execute
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, created_at, updated_at FROM users LIMIT ?, ?',
      [Number(offset), Number(limit)]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}
}

module.exports = User;
