import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // useParams để lấy ID từ URL
import '../App.css'; 

function OrderDetailPage() {
    // Lấy orderId từ URL, ví dụ: /orders/1 -> params.id là '1'
    const { id: orderId } = useParams(); 
    const [order, setOrder] = useState(null); // State lưu chi tiết đơn hàng
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetail = async () => {
            setError('');
            setLoading(true);
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem chi tiết đơn hàng.');
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                // Gọi API lấy chi tiết đơn hàng
                const { data } = await axios.get(`http://localhost:5000/api/orders/${orderId}`, config);
                setOrder(data); // Lưu dữ liệu vào state
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]); // Gọi lại API nếu orderId thay đổi

    if (loading) return <p className="container">Đang tải chi tiết đơn hàng...</p>;
    if (error) return <p className="container" style={{ color: 'red' }}>{error}</p>;
    if (!order) return <p className="container">Không tìm thấy thông tin đơn hàng.</p>; // Trường hợp không có dữ liệu

    return (
        <div className="container order-detail-page">
            <h2>Chi tiết Đơn hàng #{order.OrderID}</h2>

            {/* Thông tin chung */}
            <div className="order-summary-box"> {/* Thêm box để dễ CSS */}
                <p><strong>Ngày đặt:</strong> {new Date(order.OrderDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> 
                   <span className={`status status-${order.Status?.toLowerCase()}`}>
                       {order.Status}
                   </span>
                </p>
                <p><strong>Tổng tiền:</strong> {order.TotalAmount.toLocaleString('vi-VN')} VND</p>
                <p><strong>Địa chỉ giao hàng:</strong> {order.ShippingAddress}</p>
                <p><strong>Số điện thoại:</strong> {order.PhoneNumber}</p>
            </div>

            {/* Danh sách sản phẩm */}
            <h3>Các sản phẩm đã đặt:</h3>
            {order.orderItems && order.orderItems.length > 0 ? (
                <table className="cart-table"> {/* Tái sử dụng style bảng giỏ hàng */}
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Giá lúc mua</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item) => (
                            <tr key={item.OrderItemID}>
                                <td>
                                    <img
                                        src={`/images/${item.ImageUrl || 'placeholder.png'}`}
                                        alt={item.ProductName}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                                    />
                                </td>
                                <td>
                                    {/* Link đến trang sản phẩm nếu muốn */}
                                    <Link to={`/products/${item.ProductID}`}>{item.ProductName}</Link> 
                                </td>
                                <td style={{ textAlign: 'center' }}>{item.Quantity}</td>
                                <td style={{ textAlign: 'right' }}>{item.Price.toLocaleString('vi-VN')} VND</td>
                                <td style={{ textAlign: 'right' }}>{(item.Price * item.Quantity).toLocaleString('vi-VN')} VND</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Không có thông tin sản phẩm cho đơn hàng này.</p>
            )}

            <Link to="/order-history" className="btn" style={{ marginTop: '20px' }}>
                Quay lại Lịch sử đơn hàng
            </Link>
        </div>
    );
}

export default OrderDetailPage;
