// backend/models/service.model.js
const { pool } = require('../config/db');

class Service {
  // Lấy tất cả dịch vụ
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM services ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tìm dịch vụ theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo dịch vụ mới
  static async create(serviceData) {
    try {
      const { name, description, price } = serviceData;
      
      const [result] = await pool.execute(
        'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
        [name, description || null, price]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật dịch vụ
  static async update(id, serviceData) {
    try {
      const { name, description, price } = serviceData;
      
      const [result] = await pool.execute(
        'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?',
        [name, description || null, price, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa dịch vụ
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM services WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra dịch vụ có đang được sử dụng không
  static async isInUse(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM booking_services WHERE service_id = ?',
        [id]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Service;