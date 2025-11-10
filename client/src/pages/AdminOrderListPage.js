import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// Đảm bảo đường dẫn này chính xác: từ /pages đi ra /src rồi vào App.css
import '../App.css'; 

function AdminOrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState({}); 

    const orderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const fetchAllOrders = async () => {
        setError('');
        setLoading(true);
        const token = localStorage.getItem('userToken');

        if (!token) {
            setError('Vui lòng đăng nhập với quyền Admin.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/orders/admin/orders', config);
            setOrders(data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách đơn hàng (Admin):', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        if (!newStatus) return; 

        setUpdatingStatus(prev => ({ ...prev, [orderId]: true })); 
        setError('');
        const token = localStorage.getItem('userToken');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/status`, { status: newStatus }, config);

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.OrderID === orderId ? { ...order, Status: newStatus } : order
                )
            );
            alert(`Đã cập nhật trạng thái đơn #${orderId} thành ${newStatus}`);

        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            setError(err.response?.data?.message || 'Cập nhật trạng thái thất bại.');
        } finally {
             setUpdatingStatus(prev => ({ ...prev, [orderId]: false })); 
        }
    };


    if (loading) return <p className="container">Đang tải danh sách đơn hàng...</p>;
    if (error) return <p className="container" style={{ color: 'red' }}>Lỗi: {error}</p>;

    return (
        <div className="container admin-orders-page">
            <h2>Quản lý Đơn hàng</h2>

            {orders.length === 0 ? (
                <p>Hiện chưa có đơn hàng nào.</p>
            ) : (
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Mã Đơn</th>
                            <th>Ngày Đặt</th>
                            <th>Khách hàng</th>
                            <th>Tổng Tiền</th>
                            <th>Địa chỉ</th>
                            <th>Trạng thái Hiện tại</th>
                            <th>Cập nhật Trạng thái</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.OrderID}>
                                <td>#{order.OrderID}</td>
                                <td>{new Date(order.OrderDate).toLocaleDateString('vi-VN')}</td>
                                <td>{order.Username}</td>
                                <td>{order.TotalAmount.toLocaleString('vi-VN')} VND</td>
                                <td>{order.ShippingAddress}</td>
                                <td>
                                    <span className={`status status-${order.Status?.toLowerCase()}`}>
                                        {order.Status}
                                    </span>
                                </td>
                                <td>
                                    <select 
                                        value={order.Status} 
                                        onChange={(e) => handleStatusChange(order.OrderID, e.target.value)}
                                        disabled={updatingStatus[order.OrderID]} 
                                        style={{padding: '5px'}}
                                    >
                                        <option value="" disabled>- Chọn trạng thái -</option>
                                        {orderStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    {updatingStatus[order.OrderID] && <span style={{marginLeft: '5px'}}>...</span>} 
                                </td>
                                <td>
                                     <Link to={`/orders/${order.OrderID}`} className="btn-link">
                                        Xem
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminOrderListPage;

