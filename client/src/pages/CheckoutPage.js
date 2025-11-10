import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Để chuyển trang sau khi đặt hàng
import { useCart } from '../context/CartContext';
import axios from 'axios';
// (Giả sử bạn có AuthContext để lấy token)
// import { useAuth } from '../context/AuthContext'; 

function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  // const { user, token } = useAuth(); // Lấy token để gửi kèm API
  const navigate = useNavigate();

  // State cho form thông tin giao hàng
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(''); // State báo lỗi
  const [loading, setLoading] = useState(false); // State xử lý loading

  // --- TẠM THỜI GIẢ LẬP TOKEN ---
  // (Khi có AuthContext, bạn sẽ lấy token thật)
  const token = localStorage.getItem('userToken'); // Hoặc lấy từ AuthContext
  // --- KẾT THÚC GIẢ LẬP ---

  // Hàm xử lý khi nhấn nút Đặt hàng
  const handlePlaceOrder = async (e) => {
    e.preventDefault(); // Ngăn form submit theo cách truyền thống
    setError(''); // Reset lỗi
    setLoading(true); // Bắt đầu loading

    // Kiểm tra đã đăng nhập chưa (qua token)
    if (!token) {
        setError('Vui lòng đăng nhập để đặt hàng.');
        setLoading(false);
        // Có thể chuyển hướng đến trang đăng nhập
        // navigate('/login?redirect=/checkout'); 
        return;
    }

    // Kiểm tra thông tin nhập
    if (!shippingAddress || !phoneNumber) {
      setError('Vui lòng nhập đầy đủ địa chỉ và số điện thoại.');
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi lên API
    const orderData = {
      orderItems: cartItems.map(item => ({ // Chỉ gửi các thông tin cần thiết
        ProductID: item.ProductID,
        ProductName: item.ProductName, // Gửi tên để server báo lỗi rõ hơn nếu hết hàng
        quantity: item.quantity,
        // Không cần gửi giá, server sẽ tự lấy lại
      })),
      shippingAddress: shippingAddress,
      phoneNumber: phoneNumber,
      // totalAmount: getCartTotal() // Không cần gửi, server tự tính
    };

    try {
      // Gọi API POST /api/orders
      const config = {
        headers: {
          'Content-Type': 'application/json',
          // Gửi kèm token trong header Authorization
          Authorization: `Bearer ${token}`, 
        },
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderData, config);

      // Nếu thành công (status 201)
      alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${response.data.orderId}`);
      clearCart(); // Xóa giỏ hàng ở client
      navigate('/'); // Chuyển về trang chủ (hoặc trang Cảm ơn)

    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      // Hiển thị lỗi từ server (nếu có) hoặc lỗi chung
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Nếu giỏ hàng rỗng, không cho checkout
  if (cartItems.length === 0) {
    return (
      <div>
        <h2>Giỏ hàng trống!</h2>
        <p>Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        {/* Nút quay lại trang chủ */}
      </div>
    );
  }

  return (
    <div>
      <h1>Thanh toán Đơn hàng</h1>
      <div style={{ display: 'flex', gap: '30px' }}> {/* Chia layout */}
        {/* Cột 1: Form thông tin */}
        <div style={{ flex: 1 }}>
          <h2>Thông tin Giao hàng</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handlePlaceOrder}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="address">Địa chỉ:</label><br />
              <input
                type="text"
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                style={{ width: '90%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="phone">Số điện thoại:</label><br />
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                style={{ width: '90%', padding: '8px' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} // Vô hiệu hóa nút khi đang xử lý
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
              {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
            </button>
          </form>
        </div>

        {/* Cột 2: Tóm tắt giỏ hàng */}
        <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
          <h2>Tóm tắt Đơn hàng</h2>
          {cartItems.map(item => (
            <div key={item.ProductID} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #eee', paddingBottom: '5px' }}>
              <span>{item.ProductName} x {item.quantity}</span>
              <span>{(item.Price * item.quantity).toLocaleString('vi-VN')} VND</span>
            </div>
          ))}
          <hr />
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2em' }}>
            Tổng cộng: {getCartTotal().toLocaleString('vi-VN')} VND
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;