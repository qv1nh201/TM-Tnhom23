import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
// Đảm bảo đường dẫn này đúng: Từ /pages đi ra /src rồi vào /components
import ProductGrid from '../components/ProductGrid';
// Đảm bảo đường dẫn này đúng: Từ /pages đi ra /src rồi vào App.css
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
            setCategoryName(`Danh mục ${categoryId}`); // Set default name
            try {
                // Fetch products
                const productRes = await axios.get(`http://localhost:5000/api/products?category=${categoryId}`);
                setProducts(productRes.data);

                // Fetch category name (optional)
                try {
                     const categoryRes = await axios.get(`http://localhost:5000/api/products/categories/${categoryId}`);
                     setCategoryName(categoryRes.data.CategoryName);
                 } catch (catErr) {
                     console.warn("Could not fetch category name, using ID.");
                 }

            } catch (err) {
                console.error(`Error fetching products for category ${categoryId}:`, err);
                setError('Could not load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (categoryId && !isNaN(categoryId)) {
            fetchCategoryProducts();
        } else {
            setError('Invalid category ID.');
            setLoading(false);
        }
    }, [categoryId]);

    if (loading) return <div className="container loading-message">Đang tải sản phẩm...</div>;
    if (error) return <div className="container error-message">{error}</div>;

    return (
        <div className="container category-page card-style">
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

