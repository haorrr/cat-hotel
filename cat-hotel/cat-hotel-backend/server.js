const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { testConnection } = require('./config/db');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const catRoutes = require('./routes/cat.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const adminRoomRoutes = require('./routes/admin.room.routes');

const app = express();
const PORT = process.env.PORT || 5000;



// Middlewares
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan('dev')); // Logging
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test database connection
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoomRoutes);
const serviceRoutes = require('./routes/service.routes');
const foodRoutes = require('./routes/food.routes');

// Đăng ký routes
app.use('/api/services', serviceRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/foods', foodRoutes);
// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cat Hotel API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;