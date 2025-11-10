const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/dbConfig');

// 1. HÀM NÀY PHẢI LÀ "async"
const protect = async (req, res, next) => { 
    try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // "await" chỉ hoạt động trong hàm "async"
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, decoded.userId)
      .query('SELECT UserID, Username, Email, FullName, Role FROM Users WHERE UserID = @UserID');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    
    req.user = user;
    next();

  } catch (error) {
    console.error('LỖI XÁC THỰC TOKEN:', error);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// 2. BẠN PHẢI EXPORT MỘT OBJECT (CÓ DẤU {})
module.exports = { protect };