import React from 'react';
import { Link } from 'react-router-dom';
// Đường dẫn đúng: Từ /pages đi ra /src rồi vào App.css
import '../App.css'; 

function AdminDashboardPage() {
    return (
        // Thêm class để CSS nếu cần
        <div className="admin-dashboard"> 
            <h1>Chào mừng đến Trang Quản trị</h1>
            <p>Đây là khu vực dành cho quản trị viên.</p>
            <p>Chọn một chức năng từ menu bên trái để bắt đầu:</p>
            {/* Sử dụng class cho danh sách */}
            <ul className="admin-quick-links"> 
                 <li><Link to="/admin/orders" className="btn btn-link">Xem Đơn hàng</Link></li>
                 <li><Link to="/admin/products/new" className="btn btn-link">Thêm Sản phẩm mới</Link></li>
                 {/* (Thêm các link khác sau) */}
            </ul>
        </div>
    );
}

export default AdminDashboardPage;

