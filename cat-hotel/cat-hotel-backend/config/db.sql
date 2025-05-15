CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng cats (thông tin mèo)
CREATE TABLE cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  weight DECIMAL(5,2),
  birth_date DATE,
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo bảng room_types (loại phòng)
CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL,
  capacity INT DEFAULT 1,
  image_url VARCHAR(255)
);

-- Tạo bảng rooms (phòng)
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_type_id INT NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

-- Tạo bảng bookings (đặt phòng)
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  cat_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (cat_id) REFERENCES cats(id)
);

-- Tạo bảng services (dịch vụ)
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL
);

-- Tạo bảng booking_services (dịch vụ đi kèm đặt phòng)
CREATE TABLE booking_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Tạo bảng cat_statuses (trạng thái của mèo trong khách sạn)
CREATE TABLE cat_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  status ENUM('checked_in', 'in_care', 'resting', 'playing', 'eating', 'checked_out') DEFAULT 'checked_in',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Dữ liệu mẫu cho bảng users
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin', 'admin@cathotel.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9qBzIg.TUOCm3u.JI53ZOBu/I2yS5iO', '0987654321', 'admin'), -- password: admin123
('User Demo', 'user@example.com', '$2b$10$JJ8kIvQJ5MLYh34bYk.BwuhQB8eNfpmVjq9H07bSFuhaj5XNCxh2m', '0123456789', 'user'); -- password: user123

-- Dữ liệu mẫu cho bảng room_types
INSERT INTO room_types (name, description, price_per_day, capacity, image_url) VALUES
('Standard', 'Phòng tiêu chuẩn cho một mèo', 200000, 1, '/images/standard-room.jpg'),
('Deluxe', 'Phòng rộng rãi với đồ chơi và khu vực leo trèo', 350000, 1, '/images/deluxe-room.jpg'),
('Premium', 'Phòng cao cấp với không gian rộng và nhiều tiện nghi', 500000, 2, '/images/premium-room.jpg'),
('Family', 'Phòng gia đình cho nhiều mèo ở cùng nhau', 700000, 4, '/images/family-room.jpg');

-- Dữ liệu mẫu cho bảng rooms
INSERT INTO rooms (room_number, room_type_id, status) VALUES
('A101', 1, 'available'),
('A102', 1, 'available'),
('A103', 1, 'maintenance'),
('B201', 2, 'available'),
('B202', 2, 'occupied'),
('C301', 3, 'available'),
('C302', 3, 'available'),
('D401', 4, 'available');

-- Dữ liệu mẫu cho bảng services
INSERT INTO services (name, description, price) VALUES
('Tắm gội', 'Dịch vụ tắm gội và vệ sinh lông cho mèo', 150000),
('Cắt móng', 'Dịch vụ cắt và mài móng an toàn', 50000),
('Spa', 'Chăm sóc toàn diện, massage và làm đẹp', 300000),
('Huấn luyện', 'Dạy các kỹ năng và thói quen mới', 200000),
('Chăm sóc y tế', 'Kiểm tra sức khỏe cơ bản', 250000);