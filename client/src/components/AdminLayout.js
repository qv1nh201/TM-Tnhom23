import React from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
// Đường dẫn đúng: Từ /components đi ra /src rồi vào /context
import { useAuth } from '../context/AuthContext'; 
// Đường dẫn đúng: Từ /components đi ra /src rồi vào App.css
import '../App.css'; 

function AdminLayout() {
    // Thêm ?? {} để tránh lỗi khi context chưa sẵn sàng
    const { user, token } = useAuth() ?? {}; 

    // --- Bảo vệ Layout ---
    // Trường hợp 1: Chưa đăng nhập (không có token)
    if (token === null) { 
        console.log("AdminLayout: No token, redirecting to login.");
        // Chuyển hướng về trang login, kèm thông báo
        return <Navigate to="/login?message=Vui lòng đăng nhập để truy cập trang Admin" replace />; 
    }
    
    // Trường hợp 2: Đã có thông tin user nhưng không phải Admin
    // (Kiểm tra user !== null để đảm bảo context đã load xong)
    if (user && user.role !== 'Admin') { 
        console.log("AdminLayout: User is not Admin, redirecting to home.");
         // Chuyển hướng về trang chủ, kèm thông báo
        return <Navigate to="/?message=Bạn không có quyền truy cập trang này" replace />;
    }

     // Trường hợp 3: Đang chờ load user từ token (user === null nhưng token !== null)
     if (!user && token !== null) { 
        // Hiển thị trạng thái loading trong khi chờ AuthContext giải mã token
        return <div className='container loading-message'>Đang kiểm tra quyền Admin...</div>;
     }
     
     // Trường hợp cuối: Đã xác định là Admin (user !== null và user.role === 'Admin')
    // --- Render Layout ---
    return (
        <div className="admin-layout-container container"> 
            {/* Sidebar Menu */}
            <aside className="admin-sidebar card-style">
                <h2>Admin Panel</h2>
                <nav>
                    <ul>
                        {/* <li><Link to="/admin">Tổng quan</Link></li> */} {/* Sửa index route */}
                        <li><Link to="/admin/orders">Quản lý Đơn hàng</Link></li>
                        <li><Link to="/admin/products/new">Thêm Sản phẩm</Link></li>
                        {/* (Thêm link Quản lý Sản phẩm, QL User sau) */}
                         <li><Link to="/">Về trang Khách hàng</Link></li>
                    </ul>
                </nav>
            </aside>

            {/* Khu vực hiển thị nội dung trang con */}
            <main className="admin-main-content card-style">
                <Outlet /> {/* Render component con tương ứng */}
            </main>
        </div>
    );
}

export default AdminLayout;

