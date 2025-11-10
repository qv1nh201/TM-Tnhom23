// ==============================
// 🚀 KHỞI TẠO SERVER CHÍNH
// ==============================
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// ==============================
// 🧱 TẠO APP
// ==============================
const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// ⚙️ MIDDLEWARE CƠ BẢN
// ==============================
app.use(cors());
app.use(express.json());

// ==============================
// 📁 XỬ LÝ THƯ MỤC UPLOAD ẢNH
// ==============================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use('/uploads', express.static(uploadDir));

// ==============================
// 📦 IMPORT ROUTES
// ==============================
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/ProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Route quản trị

// ==============================
// 🧭 ĐỊNH NGHĨA ĐƯỜNG DẪN API
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ==============================
// 🧪 TEST ROUTE CƠ BẢN
// ==============================
app.get('/', (req, res) => {
  res.send('🐾 Chào mừng đến với API Máy chủ Pet Store!');
});

// ==============================
// 🚀 KHỞI ĐỘNG SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📸 Ảnh upload sẽ được phục vụ tại: http://localhost:${PORT}/uploads/`);
});
