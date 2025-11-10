import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CategoryMenu from '../components/CategoryMenu'; 
import HeroBanner from '../components/HeroBanner';
import ProductGrid from '../components/ProductGrid'; 
// Import CSS - Đảm bảo đường dẫn này chính xác
import '../App.css'; 

function HomePage() {
    // State cho từng loại sản phẩm
    const [dogProducts, setDogProducts] = useState([]);
    const [catProducts, setCatProducts] = useState([]);
    // (Có thể thêm state cho Sản phẩm mới/Hot/Giảm giá nếu muốn)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                // Gọi API lấy SP chó (ID=1) và mèo (ID=2)
                const [dogRes, catRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/products?category=1'), 
                    axios.get('http://localhost:5000/api/products?category=2')  
                ]);
                
                setDogProducts(dogRes.data);
                setCatProducts(catRes.data);

            } catch (err) {
                console.error('Lỗi khi tải sản phẩm:', err);
                setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); 

    // Phần render loading/error
    // Thêm class container để giữ padding/margin chung
    if (loading) return <div className="container">Đang tải sản phẩm...</div>; 
    if (error) return <div className="container" style={{ color: 'red' }}>{error}</div>; 

    return (
        // Bố cục chính của trang chủ: Menu bên trái, Nội dung bên phải
        // Thêm container bao ngoài homepage-layout để áp dụng max-width và căn giữa
        <div className="container homepage-container"> 
            <div className="homepage-layout"> 
                <aside className="sidebar"> {/* Phần menu bên trái */}
                    <CategoryMenu />
                     {/* Có thể thêm các banner quảng cáo nhỏ khác ở đây */}
                </aside>
                <section className="main-content"> {/* Phần nội dung chính */}
                    <HeroBanner />

                     {/* Khu vực Tabs (Tạm thời chỉ hiển thị Sản phẩm mới = Chó + Mèo) */}
                     {/* <div className="product-tabs"> ... </div> */}
                     {/* Chỉ hiển thị section nếu có sản phẩm */}
                     { (dogProducts.length > 0 || catProducts.length > 0) &&
                        <ProductGrid products={[...dogProducts, ...catProducts].sort(() => 0.5 - Math.random()).slice(0, 8)} title="Sản phẩm Mới" /> 
                     }


                    {/* Khu vực sản phẩm theo danh mục */}
                    {dogProducts.length > 0 && <ProductGrid products={dogProducts} title="Dành cho Chó" />}
                    {catProducts.length > 0 && <ProductGrid products={catProducts} title="Dành cho Mèo" />}
                    
                     {/* Brand Slider (Nếu có component) */}
                     {/* <BrandSlider /> */}
                </section>
            </div>
        </div>
    );
}

export default HomePage;

