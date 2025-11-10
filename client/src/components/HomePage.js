import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryMenu from '../components/CategoryMenu';
import HeroBanner from '../components/HeroBanner';
import ProductGrid from '../components/ProductGrid';
import '../App.css';

function HomePage() {
    const [dogProducts, setDogProducts] = useState([]);
    const [catProducts, setCatProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const [dogRes, catRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/products?category=1'),
                    axios.get('http://localhost:5000/api/products?category=2')
                ]);
                setDogProducts(dogRes.data);
                setCatProducts(catRes.data);
            } catch (err) {
                console.error('Lỗi khi tải sản phẩm:', err);
                setError('Không thể tải danh sách sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="container loading-message">Đang tải...</div>;
    if (error) return <div className="container error-message">{error}</div>;

    return (
        // Bố cục chính của trang chủ
        <div className="homepage-container container"> {/* Thêm container */}
            <div className="homepage-layout">
                <aside className="sidebar">
                    <CategoryMenu />
                    {/* Thêm banner quảng cáo nhỏ nếu muốn */}
                    <div className="side-banner card-style" style={{marginTop: '20px'}}>
                         <img src="/images/side_banner_cat.jpg" alt="Banner mèo" />
                    </div>
                     <div className="side-banner card-style" style={{marginTop: '20px'}}>
                         <img src="/images/side_banner_dog.jpg" alt="Banner chó" />
                    </div>
                </aside>
                <section className="main-content">
                    <HeroBanner />

                    {/* Product Tabs (Đơn giản hóa) */}
                    <div className="product-tabs card-style">
                        <button className="tab-button active">Sản phẩm mới</button>
                        <button className="tab-button">Sản phẩm giảm giá</button>
                        <button className="tab-button">Sản phẩm Hot</button>
                    </div>

                    {/* Chỉ hiển thị Sản phẩm mới (lấy từ chó + mèo) */}
                    <ProductGrid products={[...catProducts, ...dogProducts].slice(0, 8)} title="" />

                     {/* Có thể thêm các Section "Dành cho chó/mèo" riêng nếu muốn */}
                     {/* <ProductGrid products={dogProducts} title="Dành cho Chó" /> */}
                     {/* <ProductGrid products={catProducts} title="Dành cho Mèo" /> */}

                     {/* Brand logos (Tĩnh) */}
                     <section className="brand-section card-style">
                         <h2>Thương hiệu Đối tác</h2>
                         <div className="brand-logos">
                             {/* Thay bằng logo thật */}
                             <img src="/images/brand1.png" alt="Brand 1"/>
                             <img src="/images/brand2.png" alt="Brand 2"/>
                             <img src="/images/brand3.png" alt="Brand 3"/>
                             <img src="/images/brand4.png" alt="Brand 4"/>
                             <img src="/images/brand5.png" alt="Brand 5"/>
                         </div>
                     </section>
                </section>
            </div>
        </div>
    );
}

export default HomePage;