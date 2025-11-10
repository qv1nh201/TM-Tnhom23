import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; // Dùng chung App.css

function AdminProductListPage() {
    const { user, token } = useAuth() ?? {};
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // State cho thông báo xóa thành công

    // Hàm tải danh sách sản phẩm
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/products'); // API public lấy sản phẩm
            setProducts(data);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect để tải sản phẩm khi trang được mở
    useEffect(() => {
        fetchProducts();
    }, []);

    // --- LOGIC XÓA SẢN PHẨM ---
    const handleDelete = async (productId, productName) => {
        // 1. Hỏi xác nhận
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
            return;
        }

        try {
            setError('');
            setSuccess('');
            
            // 2. Chuẩn bị config (cần token)
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // 3. Gọi API DELETE (đã tạo ở backend)
            await axios.delete(`http://localhost:5000/api/admin/products/${productId}`, config);

            // 4. Thông báo và tải lại danh sách
            setSuccess(`Đã xóa thành công sản phẩm "${productName}".`);
            fetchProducts(); // Tải lại danh sách sản phẩm

        } catch (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
            setError(err.response?.data?.message || 'Xóa sản phẩm thất bại.');
        }
    };

    // --- Render ---
    if (loading) return <div className="container loading-message">Đang tải sản phẩm...</div>;
    
    // Kiểm tra quyền Admin (rất quan trọng)
    if (!user || user.role !== 'Admin') {
         return <div className="container error-message">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="container admin-product-list-page">
            <h2>Quản lý Sản phẩm</h2>
            
            {/* Nút để đi đến trang THÊM MỚI */}
            <Link to="/admin/products/new" className="btn btn-primary" style={{ marginBottom: '20px' }}>
                + Thêm sản phẩm mới
            </Link>

            {/* Thông báo lỗi hoặc thành công */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            {/* Bảng danh sách sản phẩm */}
            <table className="product-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Sản phẩm</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có sản phẩm nào.</td>
                        </tr>
                    ) : (
                        products.map(product => (
                            <tr key={product.ProductID}>
                                <td>{product.ProductID}</td>
                                <td>{product.ProductName}</td>
                                <td>{product.Price.toLocaleString('vi-VN')} VND</td>
                                <td>{product.StockQuantity}</td>
                                <td className="product-actions">
                                    {/* NÚT SỬA: Dẫn đến trang Sửa */}
                                    <Link 
                                        to={`/admin/product/${product.ProductID}/edit`} 
                                        className="btn btn-secondary"
                                    >
                                        Sửa
                                    </Link>
                                    
                                    {/* NÚT XÓA: Gọi hàm handleDelete */}
                                    <button 
                                        onClick={() => handleDelete(product.ProductID, product.ProductName)}
                                        className="btn btn-danger"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminProductListPage;