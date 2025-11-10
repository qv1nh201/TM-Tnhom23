const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

console.log('[OrderRoutes]',
  'createOrder:', typeof orderController.createOrder,
  'getMyOrders:', typeof orderController.getMyOrders,
  'getOrderById:', typeof orderController.getOrderById,
  'getAllOrders:', typeof orderController.getAllOrders,
  'updateOrderStatus:', typeof orderController.updateOrderStatus,
  'protect:', typeof protect,
  'admin:', typeof admin
);

// User
router.post('/', protect, orderController.createOrder);
router.get('/myorders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

// Admin
router.get('/admin/orders', protect, admin, orderController.getAllOrders);
router.put('/admin/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
