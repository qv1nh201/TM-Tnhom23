const express = require('express');
const router = express.Router();

const productController = require('../controllers/ProductController');

// ✅ middleware đúng: KHÔNG phải './routes/authRoutes'
const { protect } = require('../middleware/authMiddleware');
const { admin }   = require('../middleware/adminMiddleware');

// (nếu có upload ảnh)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${Math.round(Math.random()*1e9)}_${base}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== Routes =====

// ĐẶT categories trước /:id
router.get('/categories/all', productController.getAllCategories);
router.get('/categories/:id', productController.getCategoryById);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin: thêm/cập nhật có upload ảnh
router.post('/', protect, admin, upload.single('image'), productController.createProduct);
router.put('/:id', protect, admin, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
