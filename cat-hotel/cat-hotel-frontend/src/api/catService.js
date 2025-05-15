import axios from './axios';

const catService = {
  // Lấy danh sách mèo của user
  getCats: async () => {
    const response = await axios.get('/cats');
    return response.data;
  },

  // Lấy thông tin chi tiết mèo
  getCatById: async (id) => {
    const response = await axios.get(`/cats/${id}`);
    return response.data;
  },

  // Thêm mèo mới
  createCat: async (catData) => {
    const response = await axios.post('/cats', catData);
    return response.data;
  },

  // Cập nhật thông tin mèo
  updateCat: async (id, catData) => {
    const response = await axios.put(`/cats/${id}`, catData);
    return response.data;
  },

  // Xóa mèo
  deleteCat: async (id) => {
    const response = await axios.delete(`/cats/${id}`);
    return response.data;
  }
};

export default catService;
