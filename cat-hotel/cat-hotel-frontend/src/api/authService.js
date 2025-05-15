import axios from './axios';

const authService = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Kiểm tra người dùng đã đăng nhập chưa
  isLoggedIn: () => {
    return localStorage.getItem('token') !== null;
  },

  // Lấy thông tin user đã đăng nhập
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Lấy thông tin profile
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },

  // Cập nhật thông tin profile
  updateProfile: async (profileData) => {
    const response = await axios.put('/auth/profile', profileData);
    if (response.data.success) {
      // Cập nhật thông tin user trong localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    const response = await axios.put('/auth/change-password', passwordData);
    return response.data;
  }
};

export default authService;
