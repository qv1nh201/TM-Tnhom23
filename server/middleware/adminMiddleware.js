const admin = (req, res, next) => {
    // Kiểm tra xem 'req.user' có tồn tại không (từ middleware 'protect')
    if (req.user && req.user.Role === 'Admin') { // <-- Chú ý: 'Role' có thể viết hoa chữ 'R' tùy theo CSDL của bạn
        next();
    } else {
        // Gửi lỗi 403 (Forbidden) nếu không phải admin
        res.status(403).json({ message: 'Không có quyền Admin' });
    }
};

// BẠN PHẢI EXPORT MỘT OBJECT (CÓ DẤU {})
module.exports = { admin };