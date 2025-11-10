import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../App.css'; 

function CartPage() {
    // Lấy state và các hàm từ CartContext
    // Đảm bảo getCartTotal và clearCart được lấy ra
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart(); 

    // Kiểm tra context (có thể bỏ qua nếu đã chắc chắn chạy đúng)
    // if (!cartContext) { ... }

    if (cartItems.length === 0) {
        return (
            <div className="container text-center">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <Link to="/" className="btn">Tiếp tục mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="container cart-page">
            <h2>Giỏ hàng của bạn</h2>
            <table className="cart-table">
                {/* ... (Phần thead và tbody giữ nguyên) ... */}
                 <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Hình ảnh</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng phụ</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.ProductID}>
                            <td>{item.ProductName}</td>
                            <td>
                                <img
                                    src={`/images/${item.ImageUrl || 'placeholder.png'}`}
                                    alt={item.ProductName}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png' }}
                                />
                            </td>
                            <td>{item.Price ? item.Price.toLocaleString('vi-VN') : 0} VND</td>
                            <td>
                                <input
                                    type="number"
                                    min="1" 
                                    value={item.quantity || 1} 
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value, 10);
                                        if (!isNaN(newQuantity) && newQuantity >= 1) {
                                            updateQuantity(item.ProductID, newQuantity);
                                        } else if (e.target.value === '' || parseInt(e.target.value, 10) === 0) {
                                            if (window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
                                                removeFromCart(item.ProductID);
                                            } else {
                                                e.target.value = item.quantity || 1; 
                                            }
                                        }
                                    }}
                                    style={{ width: '60px', textAlign: 'center' }}
                                />
                            </td>
                            <td>{((Number(item.Price) || 0) * (Number(item.quantity) || 0)).toLocaleString('vi-VN')} VND</td>
                            <td>
                                <button onClick={() => removeFromCart(item.ProductID)} className="btn-remove">
                                    &times;
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="cart-summary">
                {/* === SỬA LỖI 2: Gắn hàm clearCart vào nút === */}
                <button onClick={clearCart} className="btn btn-secondary"> 
                    Xóa hết giỏ hàng
                </button>
                <div className="cart-total">
                    {/* === SỬA LỖI 1: Gọi hàm getCartTotal() để hiển thị tổng tiền === */}
                    <strong>Tổng cộng: {getCartTotal().toLocaleString('vi-VN')} VND</strong> 
                </div>
            </div>

            <div className="checkout-section">
                <Link to="/checkout" className="btn btn-primary btn-checkout">
                    Tiến hành Thanh toán
                </Link>
            </div>
        </div>
    );
}

export default CartPage;