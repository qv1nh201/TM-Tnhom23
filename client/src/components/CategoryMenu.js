import React, { useState, useEffect } from 'react';
import axios from 'axios';
// <<< THAY a bằng Link >>>
import { Link } from 'react-router-dom'; 
import '../App.css'; 

function CategoryMenu() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true); 
            setError(''); 
            try {
                const { data } = await axios.get('http://localhost:5000/api/products/categories/all');
                setCategories(data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
                setError('Không thể tải danh mục.');
            } finally {
                setLoading(false); 
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="category-menu loading">Đang tải...</div>;
    if (error) return <div className="category-menu error" style={{color: 'red'}}>{error}</div>;

    return (
        <nav className="category-menu card-style"> 
            <h3> Danh mục Sản phẩm</h3>
            <ul>
                {categories.map(category => (
                    <li key={category.CategoryID}>
                        {/* === SỬA LẠI: Dùng Link thay cho a === */}
                        {/* 'to' sẽ trỏ đến URL /category/1, /category/2 ... */}
                        <Link to={`/category/${category.CategoryID}`}> 
                             {/* <i className="fas fa-paw icon"></i> */} {/* Bỏ icon nếu chưa cài FontAwesome */}
                             {category.CategoryName}
                        </Link>
                    </li>
                ))}
                 {/* Link "Xem tất cả" có thể trỏ về trang chủ hoặc 1 trang /products khác */}
                 <li><Link to="/">Xem tất cả</Link></li> 
            </ul>
        </nav>
    );
}
export default CategoryMenu;

