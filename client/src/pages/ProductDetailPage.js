import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
// Đường dẫn đúng: Từ /pages đi ra /src rồi vào /context
import { useCart } from '../context/CartContext'; 
// Đường dẫn đúng: Từ /pages đi ra /src rồi vào App.css
import '../App.css'; 

function ProductDetailPage() {
    const { id: productId } = useParams(); 
    // Lấy hàm addToCart từ context (đảm bảo useCart được import đúng)
    const { addToCart } = useCart(); 

    const [product, setProduct] = useState(null); 
    const [quantity, setQuantity] = useState(1); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProductDetail = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${productId}`);
                setProduct(data);
                setQuantity(1); 
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
                setError(err.response?.data?.message || 'Không thể tải chi tiết sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [productId]); 

    // Hàm xử lý tăng/giảm số lượng
    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            if (newQuantity < 1) return 1;
            if (product && newQuantity > product.StockQuantity) {
                alert(`Số lượng tồn kho không đủ (Chỉ còn ${product.StockQuantity})`);
                return product.StockQuantity;
            }
            return newQuantity;
        });
    };
    
    // Hàm xử lý khi nhấn nút Thêm vào giỏ
    const handleAddToCart = () => {
        if (product && addToCart) { // Kiểm tra addToCart tồn tại
             const itemToAdd = { 
                ...product, 
                quantity: quantity 
             };
            addToCart(itemToAdd); 
        } else {
            console.error("addToCart function is not available from useCart");
            alert("Lỗi: Không thể thêm vào giỏ hàng.");
        }
    };


    if (loading) return <div className="container loading-message">Đang tải...</div>;
    if (error) return <div className="container error-message">{error}</div>;
    if (!product) return <div className="container">Không tìm thấy sản phẩm.</div>;

    return (
        <div className="container product-detail-container"> 
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link to="/">Trang chủ</Link> &gt; 
                {/* Cố gắng hiển thị tên Category nếu có */}
                {product.CategoryName && product.CategoryID && 
                    <>
                        <Link to={`/category/${product.CategoryID}`}>{product.CategoryName}</Link> &gt; 
                    </>
                }
                <span>{product.ProductName}</span>
            </div>

            <div className="product-detail-layout">
                 {/* Cột Ảnh sản phẩm */}
                 <div className="product-image-column">
                    <img
                    src={`http://localhost:5000${product.ImageUrl}`}
                    alt={product.ProductName}
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                 </div>

                 {/* Cột Thông tin và Mua hàng */}
                 <div className="product-info-column">
                    <h1>{product.ProductName}</h1>
                    
                    <p className="price">{product.Price ? product.Price.toLocaleString('vi-VN') : 'N/A'} VND</p>
                    
                    {/* Chọn Số lượng */}
                    <div className="quantity-selector">
                        <label>Số lượng:</label>
                        <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                        <input 
                            type="number" 
                            value={quantity} 
                            min="1"
                            max={product.StockQuantity || 1} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= (product.StockQuantity || 1)) {
                                    setQuantity(val);
                                } else if (e.target.value === '') {
                                     setQuantity(1); 
                                }
                            }} 
                        />
                        <button onClick={() => handleQuantityChange(1)} disabled={quantity >= (product.StockQuantity || 1)}>+</button>
                        <span className="stock-info">(Còn {product.StockQuantity || 0} sản phẩm)</span>
                    </div>

                    {/* Nút Thêm vào giỏ */}
                    <button 
                        className="btn btn-primary btn-add-to-cart" 
                        onClick={handleAddToCart}
                        disabled={!product.StockQuantity || product.StockQuantity < 1} 
                    >
                        {(!product.StockQuantity || product.StockQuantity < 1) ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>
                 </div>
            </div>

            {/* Phần Mô tả chi tiết */}
            <div className="product-description-section card-style">
                <h2>Thông tin sản phẩm</h2>
                {product.Description ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{product.Description}</p> 
                ) : (
                    <p>Chưa có mô tả cho sản phẩm này.</p>
                )}
            </div>
        </div>
    );
}

export default ProductDetailPage;

