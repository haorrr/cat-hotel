// backend/routes/service.routes.js
const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/service.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes công khai
router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);

// Routes admin (yêu cầu quyền admin)
router.post('/', authenticateToken, isAdmin, ServiceController.createService);
router.put('/:id', authenticateToken, isAdmin, ServiceController.updateService);
router.delete('/:id', authenticateToken, isAdmin, ServiceController.deleteService);

module.exports = router;