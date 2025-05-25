// backend/models/food.model.js
const { pool } = require('../config/db');

class Food {
  // Lấy tất cả thức ăn
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM foods ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tìm thức ăn theo id
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM foods WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo thức ăn mới
  static async create(foodData) {
    try {
      const { name, description, price, image_url } = foodData;
      
      const [result] = await pool.execute(
        'INSERT INTO foods (name, description, price, image_url) VALUES (?, ?, ?, ?)',
        [name, description || null, price, image_url || null]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thức ăn
  static async update(id, foodData) {
    try {
      const { name, description, price, image_url } = foodData;
      
      const [result] = await pool.execute(
        'UPDATE foods SET name = ?, description = ?, price = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description || null, price, image_url || null, id]
      );
      
      if (result.affectedRows > 0) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa thức ăn
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM foods WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra thức ăn có tồn tại không
  static async exists(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM foods WHERE id = ?',
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm thức ăn theo tên
  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM foods WHERE name LIKE ? ORDER BY name',
        [`%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thức ăn theo khoảng giá
  static async getByPriceRange(minPrice, maxPrice) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM foods WHERE price BETWEEN ? AND ? ORDER BY price',
        [minPrice, maxPrice]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thức ăn được sử dụng nhiều nhất
  static async getMostPopular(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*, COUNT(bf.food_id) as usage_count 
         FROM foods f 
         LEFT JOIN booking_foods bf ON f.id = bf.food_id 
         GROUP BY f.id 
         ORDER BY usage_count DESC, f.name 
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra thức ăn có đang được sử dụng trong booking không
  static async isInUse(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM booking_foods WHERE food_id = ?',
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê về thức ăn
  static async getStatistics() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_foods,
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price
         FROM foods`
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Food;