import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// Đảm bảo đường dẫn này chính xác: từ /pages đi ra /src rồi vào App.css
import '../App.css';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

     useEffect(() => {
        const fetchOrders = async () => {
            setError('');
            setLoading(true);
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(data);
            } catch (err) {
                console.error('Lỗi khi lấy lịch sử đơn hàng:', err);
                setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <p className="container">Đang tải dữ liệu...</p>;
    if (error) return <p className="container" style={{ color: 'red' }}>{error}</p>;


    return (
        <div className="container order-history-page">
            <h2>Lịch sử Đơn hàng của bạn</h2>

            {!loading && !error && (
                <>
                    {orders.length === 0 ? (
                        <p>Bạn chưa có đơn hàng nào.</p>
                    ) : (
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Ngày Đặt</th>
                                    <th>Tổng Tiền</th>
                                    <th>Địa chỉ</th>
                                    <th>Trạng thái</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.OrderID}>
                                        <td>#{order.OrderID}</td>
                                        <td>{new Date(order.OrderDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{order.TotalAmount.toLocaleString('vi-VN')} VND</td>
                                        <td>{order.ShippingAddress}</td>
                                        <td>
                                            <span className={`status status-${order.Status?.toLowerCase()}`}>
                                                {order.Status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/orders/${order.OrderID}`} className="btn-link">
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
             <Link to="/" className="btn" style={{marginTop: '20px'}}>Quay về trang chủ</Link>
        </div>
    );
}

export default OrderHistoryPage;

