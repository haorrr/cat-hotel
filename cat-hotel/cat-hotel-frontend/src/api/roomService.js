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
  }
};

export default roomService;
