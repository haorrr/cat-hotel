import axios from './axios';

const adminService = {
  // Lấy danh sách tất cả người dùng
  getUsers: async (limit = 100, offset = 0) => {
    const response = await axios.get('/admin/users', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Lấy danh sách tất cả đơn đặt phòng
  getBookings: async (limit = 100, offset = 0, status = null) => {
    const params = { limit, offset };
    if (status) {
      params.status = status;
    }
    
    const response = await axios.get('/admin/bookings', { params });
    return response.data;
  },

  // Cập nhật trạng thái đơn đặt phòng
  updateBookingStatus: async (id, status) => {
    const response = await axios.put(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },

  // Cập nhật trạng thái của mèo
  updateCatStatus: async (bookingId, status, notes) => {
    const response = await axios.post(`/admin/bookings/${bookingId}/cat-status`, {
      status,
      notes
    });
    return response.data;
  },

  // Cập nhật trạng thái phòng
  updateRoomStatus: async (id, status) => {
    const response = await axios.put(`/admin/rooms/${id}/status`, { status });
    return response.data;
  }
};

export default adminService;
