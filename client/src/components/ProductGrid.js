import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function ProductGrid({ products, title }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="product-section card-style"> {/* Thêm card-style */}
            {title && <h2>{title}</h2>}
            <ul className="product-grid">
                {products.map((product) => (
                    <li key={product.ProductID} className="product-grid-item">
                        <Link to={`/products/${product.ProductID}`}>
                             <img
                                src={`/images/${product.ImageUrl || 'placeholder.png'}`}
                                alt={product.ProductName}
                                onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                            />
                            <div className="product-info">
                                <h3>{product.ProductName}</h3>
                                <p>{product.Price ? product.Price.toLocaleString('vi-VN') : 'N/A'} VND</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
export default ProductGrid;