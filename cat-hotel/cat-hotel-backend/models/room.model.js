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

  // Tìm phòng theo số phòng
  static async findByRoomNumber(roomNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rooms WHERE room_number = ?',
        [roomNumber]
      );
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

  // Tạo phòng mới
  static async create(roomData) {
    try {
      const { room_number, room_type_id, status } = roomData;
      
      const [result] = await pool.execute(
        'INSERT INTO rooms (room_number, room_type_id, status) VALUES (?, ?, ?)',
        [room_number, room_type_id, status || 'available']
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin phòng
  static async update(id, roomData) {
    try {
      const { room_number, room_type_id, status } = roomData;
      
      const [result] = await pool.execute(
        'UPDATE rooms SET room_number = ?, room_type_id = ?, status = ? WHERE id = ?',
        [room_number, room_type_id, status, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa phòng
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM rooms WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra phòng có đơn đặt phòng liên quan không
  static async hasBookings(roomId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE room_id = ?',
        [roomId]
      );
      
      return rows[0].count > 0;
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

  // Tạo loại phòng mới
  static async create(typeData) {
    try {
      const { name, description, price_per_day, capacity, image_url } = typeData;
      
      const [result] = await pool.execute(
        'INSERT INTO room_types (name, description, price_per_day, capacity, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, description || null, price_per_day, capacity || 1, image_url || null]
      );
      
      if (result.insertId) {
        return this.findById(result.insertId);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin loại phòng
  static async update(id, typeData) {
    try {
      const { name, description, price_per_day, capacity, image_url } = typeData;
      
      const [result] = await pool.execute(
        'UPDATE room_types SET name = ?, description = ?, price_per_day = ?, capacity = ?, image_url = ? WHERE id = ?',
        [name, description || null, price_per_day, capacity || 1, image_url, id]
      );
      
      if (result.affectedRows) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Xóa loại phòng
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM room_types WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra loại phòng có đang được sử dụng bởi phòng nào không
  static async hasRooms(typeId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ?',
        [typeId]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  Room,
  RoomType
};