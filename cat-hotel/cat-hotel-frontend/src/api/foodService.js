// frontend/src/api/foodService.js
import axios from './axios';

const foodService = {
  // Lấy danh sách tất cả thức ăn
  getFoods: async () => {
    const response = await axios.get('/foods');
    return response.data;
  },

  // Lấy thông tin chi tiết thức ăn
  getFoodById: async (id) => {
    const response = await axios.get(`/foods/${id}`);
    return response.data;
  },

  // Thêm thức ăn mới (admin)
  createFood: async (foodData) => {
    const response = await axios.post('/admin/foods', foodData);
    return response.data;
  },

  // Cập nhật thông tin thức ăn (admin)
  updateFood: async (id, foodData) => {
    const response = await axios.put(`/admin/foods/${id}`, foodData);
    return response.data;
  },

  // Xóa thức ăn (admin)
  deleteFood: async (id) => {
    const response = await axios.delete(`/admin/foods/${id}`);
    return response.data;
  }
};

export default foodService;