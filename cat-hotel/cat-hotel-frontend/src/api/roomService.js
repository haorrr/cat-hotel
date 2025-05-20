import axios from './axios';

const roomService = {
  // Lấy danh sách tất cả phòng
  getRooms: async () => {
    const response = await axios.get('/rooms');
    return response.data;
  },

  // Lấy thông tin chi tiết phòng
  getRoomById: async (id) => {
    const response = await axios.get(`/rooms/${id}`);
    return response.data;
  },

  // Lấy danh sách phòng trống trong khoảng thời gian
  getAvailableRooms: async (checkInDate, checkOutDate) => {
    const response = await axios.get(`/rooms/available`, {
      params: {
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      }
    });
    return response.data;
  },

  // Lấy danh sách loại phòng
  getRoomTypes: async () => {
    const response = await axios.get('/rooms/types');
    return response.data;
  },
  
  // Lấy thông tin chi tiết loại phòng
  getRoomTypeById: async (id) => {
    const response = await axios.get(`/rooms/types/${id}`);
    return response.data;
  },
  
  // Thêm phòng mới (chỉ admin)
  createRoom: async (roomData) => {
    const response = await axios.post('/admin/rooms', roomData);
    return response.data;
  },
  
  // Cập nhật thông tin phòng (chỉ admin)
  updateRoom: async (id, roomData) => {
    const response = await axios.put(`/admin/rooms/${id}`, roomData);
    return response.data;
  },
  
  // Xóa phòng (chỉ admin)
  deleteRoom: async (id) => {
    const response = await axios.delete(`/admin/rooms/${id}`);
    return response.data;
  },
  
  // Thêm loại phòng mới (chỉ admin)
  createRoomType: async (typeData) => {
    const response = await axios.post('/admin/room-types', typeData);
    return response.data;
  },
  
  // Cập nhật loại phòng (chỉ admin)
  updateRoomType: async (id, typeData) => {
    const response = await axios.put(`/admin/room-types/${id}`, typeData);
    return response.data;
  },
  
  // Xóa loại phòng (chỉ admin)
  deleteRoomType: async (id) => {
    const response = await axios.delete(`/admin/room-types/${id}`);
    return response.data;
  },
  
  // Upload hình ảnh phòng (chỉ admin)
  uploadRoomImage: async (roomTypeId, formData) => {
    const response = await axios.post(`/admin/room-types/${roomTypeId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Lấy danh sách ảnh của loại phòng
  getRoomTypeImages: async (roomTypeId) => {
    const response = await axios.get(`/admin/room-types/${roomTypeId}/images`);
    return response.data;
  },

  // Upload ảnh cho loại phòng
  uploadRoomTypeImage: async (roomTypeId, formData) => {
    const response = await axios.post(`/admin/room-types/${roomTypeId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Xóa ảnh
  deleteRoomTypeImage: async (imageId) => {
    const response = await axios.delete(`/admin/room-images/${imageId}`);
    return response.data;
  },

  // Đặt ảnh làm ảnh chính
  setPrimaryRoomTypeImage: async (imageId, roomTypeId) => {
    const response = await axios.put(`/admin/room-images/${imageId}/set-primary`, {
      room_type_id: roomTypeId
    });
    return response.data;
  }
};

export default roomService;