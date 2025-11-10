import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Đường dẫn đúng: Từ /components đi ra /src rồi vào /context
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
// Đường dẫn đúng: Từ /components đi ra /src rồi vào App.css
import '../App.css';

function Navbar() {
    // Thêm ?? {} để tránh lỗi khi context chưa sẵn sàng
    const { user, logout } = useAuth() ?? {};
    const { cartItems } = useCart() ?? { cartItems: [] };
    const navigate = useNavigate();

    // Đảm bảo cartItems là mảng trước khi reduce
    const totalItems = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

    const handleLogout = () => {
        if (logout) {
             logout();
             // Chuyển hướng về trang chủ sau khi logout
             navigate('/');
             alert('Đã đăng xuất!');
             // Cân nhắc reload nếu cần reset state hoàn toàn, nhưng thường context sẽ xử lý
             // window.location.reload();
        } else {
            console.error("Hàm logout không tồn tại trên context!");
        }
    };

    return (
        // Sử dụng các class CSS đã định nghĩa
        <header className="main-header">
            <div className="main-nav-container container">
                {/* Logo */}
                <div className="logo">
                    <Link to="/">
                        {/* Thay bằng logo thật */}
                        <img src="/images/logotrangchu.jpg" alt="Pet Store Logo" style={{ height: '40px' }}/>
                        <span>Pet Store</span>
                    </Link>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="search-bar">
                    <input type="text" placeholder="Nhập từ khóa cần tìm..." />
                    <button>Tìm kiếm</button>
                </div>

                {/* Các icon bên phải */}
                <div className="nav-icons">
                    {user ? (
                        <>
                            <div className="user-menu">
                                <span>Chào, {user.username || 'Bạn'}!</span>
                                <div className="user-dropdown">
                                    <Link to="/order-history">Lịch sử đơn hàng</Link>
                                    {user.role === 'Admin' && (
                                        <>
                                            <Link to="/admin/orders">Quản lý Đơn hàng</Link>
                                            <Link to="/admin/products">Quản lý Sản Phẩm</Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout}>Đăng xuất</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Sử dụng class nav-icon-item */}
                            <Link to="/login" className="nav-icon-item">
                                <span>Đăng nhập</span>
                            </Link>
                            <Link to="/register" className="nav-icon-item">
                                <span>Đăng ký</span>
                            </Link>
                        </>
                    )}
                    {/* Sử dụng class nav-icon-item */}
                    <Link to="/cart" className="nav-icon-item">
                         🛒 {/* Icon giỏ hàng */}
                        <span>Giỏ hàng ({totalItems})</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
export default Navbar;

