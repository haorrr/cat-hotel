import axios from './axios';

const bookingService = {
  // Lấy danh sách đặt phòng của user
  getBookings: async () => {
    const response = await axios.get('/bookings');
    return response.data;
  },

  // Lấy thông tin chi tiết đặt phòng
  getBookingById: async (id) => {
    const response = await axios.get(`/bookings/${id}`);
    return response.data;
  },

  // Đặt phòng mới
  createBooking: async (bookingData) => {
    const response = await axios.post('/bookings', bookingData);
    return response.data;
  },

  // Hủy đặt phòng
  cancelBooking: async (id) => {
    const response = await axios.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};

export default bookingService;
