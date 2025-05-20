const { Room, RoomType } = require('../models/room.model');
const RoomImage = require('../models/room-image.model');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../config/db');

class RoomController {
  // Lấy danh sách tất cả phòng
  static async getRooms(req, res) {
    try {
      const rooms = await Room.getAll();
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách phòng'
      });
    }
  }

  // Lấy thông tin chi tiết phòng
  static async getRoomById(req, res) {
    try {
      const roomId = req.params.id;
      
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Get room by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin phòng'
      });
    }
  }

  // Lấy danh sách phòng trống trong khoảng thời gian
  static async getAvailableRooms(req, res) {
    try {
      const { check_in_date, check_out_date } = req.query;
      
      if (!check_in_date || !check_out_date) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ngày nhận và trả phòng'
        });
      }
      
      // Kiểm tra ngày hợp lệ
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Ngày không hợp lệ'
        });
      }
      
      if (checkIn >= checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Ngày trả phòng phải sau ngày nhận phòng'
        });
      }
      
      const rooms = await Room.getAvailable(check_in_date, check_out_date);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Get available rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách phòng trống'
      });
    }
  }

  // Lấy tất cả loại phòng
  static async getRoomTypes(req, res) {
    try {
      const roomTypes = await RoomType.getAll();
      
      res.json({
        success: true,
        data: roomTypes
      });
    } catch (error) {
      console.error('Get room types error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách loại phòng'
      });
    }
  }

  // Lấy thông tin chi tiết loại phòng
  static async getRoomTypeById(req, res) {
    try {
      const typeId = req.params.id;
      
      const roomType = await RoomType.findById(typeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại phòng'
        });
      }
      
      res.json({
        success: true,
        data: roomType
      });
    } catch (error) {
      console.error('Get room type by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin loại phòng'
      });
    }
  }

  // Cập nhật trạng thái phòng (chỉ dành cho admin)
  static async updateRoomStatus(req, res) {
    try {
      const roomId = req.params.id;
      const { status } = req.body;
      
      if (!['available', 'occupied', 'maintenance'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái phòng không hợp lệ'
        });
      }
      
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      const updatedRoom = await Room.updateStatus(roomId, status);
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái phòng thành công',
        data: updatedRoom
      });
    } catch (error) {
      console.error('Update room status error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật trạng thái phòng'
      });
    }
  }

  // Thêm phòng mới (chỉ admin)
  static async createRoom(req, res) {
    try {
      const { room_number, room_type_id, status } = req.body;
      
      // Kiểm tra số phòng đã tồn tại chưa
      const existingRoom = await Room.findByRoomNumber(room_number);
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Số phòng đã tồn tại'
        });
      }
      
      // Kiểm tra loại phòng tồn tại
      const roomType = await RoomType.findById(room_type_id);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Loại phòng không tồn tại'
        });
      }
      
      // Thêm phòng mới
      const newRoom = await Room.create({
        room_number,
        room_type_id,
        status: status || 'available'
      });
      
      res.status(201).json({
        success: true,
        message: 'Thêm phòng mới thành công',
        data: newRoom
      });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm phòng mới'
      });
    }
  }

  // Cập nhật thông tin phòng (chỉ admin)
  static async updateRoom(req, res) {
    try {
      const roomId = req.params.id;
      const { room_number, room_type_id, status } = req.body;
      
      // Kiểm tra phòng tồn tại
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      // Nếu số phòng thay đổi, kiểm tra trùng lặp
      if (room_number !== room.room_number) {
        const existingRoom = await Room.findByRoomNumber(room_number);
        if (existingRoom) {
          return res.status(400).json({
            success: false,
            message: 'Số phòng đã tồn tại'
          });
        }
      }
      
      // Kiểm tra loại phòng tồn tại
      if (room_type_id) {
        const roomType = await RoomType.findById(room_type_id);
        if (!roomType) {
          return res.status(404).json({
            success: false,
            message: 'Loại phòng không tồn tại'
          });
        }
      }
      
      // Cập nhật thông tin phòng
      const updatedRoom = await Room.update(roomId, {
        room_number,
        room_type_id,
        status
      });
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin phòng thành công',
        data: updatedRoom
      });
    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin phòng'
      });
    }
  }

  // Xóa phòng (chỉ admin)
  static async deleteRoom(req, res) {
    try {
      const roomId = req.params.id;
      
      // Kiểm tra phòng tồn tại
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng'
        });
      }
      
      // Kiểm tra phòng có đơn đặt phòng liên quan không
      const hasBookings = await Room.hasBookings(roomId);
      if (hasBookings) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa phòng có đơn đặt phòng liên quan'
        });
      }
      
      // Xóa phòng
      await Room.delete(roomId);
      
      res.json({
        success: true,
        message: 'Xóa phòng thành công'
      });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa phòng'
      });
    }
  }

  // Thêm loại phòng mới (chỉ admin)
  static async createRoomType(req, res) {
    try {
      const { name, description, detailed_description, price_per_day, capacity } = req.body;
      
      // Thêm loại phòng mới
      const newRoomType = await RoomType.create({
        name,
        description,
        detailed_description,
        price_per_day,
        capacity,
        image_url: null // Ảnh sẽ được cập nhật sau
      });
      
      res.status(201).json({
        success: true,
        message: 'Thêm loại phòng mới thành công',
        data: newRoomType
      });
    } catch (error) {
      console.error('Create room type error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm loại phòng mới'
      });
    }
  }

  // Cập nhật thông tin loại phòng (chỉ admin)
  static async updateRoomType(req, res) {
    try {
      const typeId = req.params.id;
      const { name, description, detailed_description, price_per_day, capacity, image_url } = req.body;
      
      // Kiểm tra loại phòng tồn tại
      const roomType = await RoomType.findById(typeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại phòng'
        });
      }
      
      // Cập nhật thông tin loại phòng
      const updatedRoomType = await RoomType.update(typeId, {
        name,
        description,
        detailed_description,
        price_per_day,
        capacity,
        image_url: image_url || roomType.image_url
      });
      
      res.json({
        success: true,
        message: 'Cập nhật loại phòng thành công',
        data: updatedRoomType
      });
    } catch (error) {
      console.error('Update room type error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật loại phòng'
      });
    }
  }

  // Xóa loại phòng (chỉ admin)
  static async deleteRoomType(req, res) {
    try {
      const typeId = req.params.id;
      
      // Kiểm tra loại phòng tồn tại
      const roomType = await RoomType.findById(typeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại phòng'
        });
      }
      
      // Kiểm tra có phòng nào đang sử dụng loại phòng này không
      const hasRooms = await RoomType.hasRooms(typeId);
      if (hasRooms) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa loại phòng đang được sử dụng bởi phòng'
        });
      }
      
      // Xóa ảnh nếu có
      if (roomType.image_url) {
        const imagePath = path.join(__dirname, '../../public', roomType.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Xóa tất cả hình ảnh của loại phòng
      await RoomImage.deleteByRoomTypeId(typeId);
      
      // Xóa loại phòng
      await RoomType.delete(typeId);
      
      res.json({
        success: true,
        message: 'Xóa loại phòng thành công'
      });
    } catch (error) {
      console.error('Delete room type error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa loại phòng'
      });
    }
  }

  // Cấu hình multer để upload ảnh
  static uploadConfig() {
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/rooms');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'room-' + uniqueSuffix + ext);
      }
    });
    
    const fileFilter = (req, file, cb) => {
      // Chỉ chấp nhận các file ảnh
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file ảnh'), false);
      }
    };
    
    return multer({ 
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
      }
    });
  }

  // Lấy danh sách ảnh của loại phòng
  static async getRoomTypeImages(req, res) {
    try {
      const typeId = req.params.id;
      
      // Kiểm tra loại phòng tồn tại
      const roomType = await RoomType.findById(typeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại phòng'
        });
      }
      
      const images = await RoomImage.getByRoomTypeId(typeId);
      
      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Get room type images error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách hình ảnh'
      });
    }
  }

  // Upload hình ảnh cho loại phòng
  static async uploadRoomTypeImage(req, res) {
    try {
      const typeId = req.params.id;
      const isPrimary = req.body.is_primary === '1';
      
      // Kiểm tra loại phòng tồn tại
      const roomType = await RoomType.findById(typeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy loại phòng'
        });
      }
      
      // Kiểm tra có file upload không
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không có file được upload'
        });
      }
      
      // Thêm ảnh mới vào cơ sở dữ liệu
      const imageUrl = '/images/rooms/' + req.file.filename;
      const newImage = await RoomImage.create({
        room_type_id: typeId,
        image_url: imageUrl,
        is_primary: isPrimary ? 1 : 0
      });
      
      // Cập nhật image_url chính trong room_types nếu là ảnh chính
      if (isPrimary) {
        await RoomType.update(typeId, {
          ...roomType,
          image_url: imageUrl
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Upload ảnh thành công',
        data: newImage
      });
    } catch (error) {
      console.error('Upload room type image error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi upload ảnh'
      });
    }
  }

  // Xóa hình ảnh
  static async deleteRoomTypeImage(req, res) {
    try {
      const imageId = req.params.id;
      
      // Lấy thông tin ảnh trước khi xóa
      const [rows] = await pool.execute(
        'SELECT * FROM room_images WHERE id = ?',
        [imageId]
      );
      
      const image = rows[0];
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hình ảnh'
        });
      }
      
      // Xóa file ảnh nếu tồn tại
      const imagePath = path.join(__dirname, '../../public', image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Xóa bản ghi trong cơ sở dữ liệu
      await RoomImage.delete(imageId);
      
      // Nếu là ảnh chính, cập nhật ảnh chính mới (nếu có)
      if (image.is_primary) {
        const images = await RoomImage.getByRoomTypeId(image.room_type_id);
        if (images.length > 0) {
          // Đặt ảnh đầu tiên thành ảnh chính
          await RoomImage.setPrimary(images[0].id, image.room_type_id);
          
          // Cập nhật image_url trong bảng room_types
          const roomType = await RoomType.findById(image.room_type_id);
          await RoomType.update(image.room_type_id, {
            ...roomType,
            image_url: images[0].image_url
          });
        } else {
          // Nếu không còn ảnh nào, cập nhật image_url thành null
          const roomType = await RoomType.findById(image.room_type_id);
          await RoomType.update(image.room_type_id, {
            ...roomType,
            image_url: null
          });
        }
      }
      
      res.json({
        success: true,
        message: 'Xóa ảnh thành công'
      });
    } catch (error) {
      console.error('Delete room type image error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa ảnh'
      });
    }
  }

  // Đặt hình ảnh làm ảnh chính
  static async setPrimaryRoomTypeImage(req, res) {
    try {
      const imageId = req.params.id;
      const { room_type_id } = req.body;
      
      // Kiểm tra ảnh tồn tại
      const [rows] = await pool.execute(
        'SELECT * FROM room_images WHERE id = ?',
        [imageId]
      );
      
      const image = rows[0];
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hình ảnh'
        });
      }
      
      // Đặt ảnh làm ảnh chính
      await RoomImage.setPrimary(imageId, room_type_id);
      
      // Cập nhật image_url trong bảng room_types
      const roomType = await RoomType.findById(room_type_id);
      await RoomType.update(room_type_id, {
        ...roomType,
        image_url: image.image_url
      });
      
      res.json({
        success: true,
        message: 'Đặt ảnh chính thành công'
      });
    } catch (error) {
      console.error('Set primary room type image error:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi đặt ảnh chính'
      });
    }
  }
}

module.exports = RoomController;