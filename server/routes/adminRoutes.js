const express = require('express');
const router = express.Router();

// 1. IMPORT THÊM 2 HÀM MỚI TỪ CONTROLLER
const { 
    createProduct, 
    updateProduct, // <-- THÊM DÒNG NÀY
    deleteProduct  // <-- THÊM DÒNG NÀY
} = require('../controllers/ProductController'); 

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

/*
* @route   POST /api/admin/products
* @desc    Tạo một sản phẩm mới (Admin)
*/
router.post('/products', protect, admin, createProduct);

/*
* @route   PUT /api/admin/products/:id
* @desc    Cập nhật (sửa) một sản phẩm (Admin)
*/
// 2. THÊM ROUTE "SỬA" (PUT)
router.put('/products/:id', protect, admin, updateProduct);

/*
* @route   DELETE /api/admin/products/:id
* @desc    Xóa một sản phẩm (Admin)
*/
// 3. THÊM ROUTE "XÓA" (DELETE)
router.delete('/products/:id', protect, admin, deleteProduct);

// Phải export router để server.js có thể 'require' được
module.exports = router;