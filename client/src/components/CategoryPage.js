import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; 
// Đường dẫn đúng: Từ /pages đi ra /src rồi vào /components
import ProductGrid from '../components/ProductGrid'; 
// Đường dẫn đúng: Từ /pages đi ra /src rồi vào App.css
import '../App.css'; 

function CategoryPage() {
    const { categoryId } = useParams(); 
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            setLoading(true);
            setError('');
            // Đặt tên Category mặc định trước khi fetch
            setCategoryName(`Danh mục ${categoryId}`); 
            try {
                // Gọi API lấy sản phẩm
                const productRes = await axios.get(`http://localhost:5000/api/products?category=${categoryId}`);
                setProducts(productRes.data);

                // Gọi API lấy tên danh mục
                try {
                     const categoryRes = await axios.get(`http://localhost:5000/api/products/categories/${categoryId}`); 
                     // Cập nhật lại tên nếu thành công
                     setCategoryName(categoryRes.data.CategoryName); 
                 } catch (catErr) {
                     console.warn("Không thể lấy tên danh mục.");
                 }

            } catch (err) {
                console.error(`Lỗi khi tải sản phẩm cho danh mục ${categoryId}:`, err);
                setError('Không thể tải danh sách sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts(); 
    }, [categoryId]); 

    if (loading) return <div className="container loading-message">Đang tải...</div>;
    if (error) return <div className="container error-message">{error}</div>;

    return (
        <div className="container category-page"> 
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Link to="/">Trang chủ</Link> &gt; 
                <span>{categoryName || `Danh mục ${categoryId}`}</span>
            </div>

            <h1>{categoryName || `Sản phẩm`}</h1> 

            {products.length === 0 ? (
                <p>Không có sản phẩm nào trong danh mục này.</p>
            ) : (
                <ProductGrid products={products} title="" /> 
            )}

            <Link to="/" className="btn" style={{ marginTop: '30px', display: 'inline-block' }}>
                &larr; Quay về Trang chủ 
            </Link>
        </div>
    );
}

export default CategoryPage;

