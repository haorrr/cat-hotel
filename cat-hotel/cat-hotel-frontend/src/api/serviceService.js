// frontend/src/api/serviceService.js
import axios from './axios';

const serviceService = {
  // Lấy danh sách tất cả dịch vụ
  getServices: async () => {
    const response = await axios.get('/services');
    return response.data;
  },

  // Lấy thông tin chi tiết dịch vụ
  getServiceById: async (id) => {
    const response = await axios.get(`/services/${id}`);
    return response.data;
  },

  // Thêm dịch vụ mới (admin)
  createService: async (serviceData) => {
    const response = await axios.post('/admin/services', serviceData);
    return response.data;
  },

  // Cập nhật thông tin dịch vụ (admin)
  updateService: async (id, serviceData) => {
    const response = await axios.put(`/admin/services/${id}`, serviceData);
    return response.data;
  },

  // Xóa dịch vụ (admin)
  deleteService: async (id) => {
    const response = await axios.delete(`/admin/services/${id}`);
    return response.data;
  }
};

export default serviceService;