import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 1. IMPORT THÊM useParams VÀ SỬA LẠI Link
import { useNavigate, Link, useParams } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import '../App.css';

function AdminProductEditPage() {
    const { user, token } = useAuth() ?? {};
    const navigate = useNavigate();
    
    // 2. LẤY ID SẢN PHẨM TỪ URL
    const { id: productId } = useParams(); // Lấy 'id' từ URL và đổi tên thành 'productId'

    // === State cho các trường trong form ===
    // (Giữ nguyên các state: productName, description, price, v.v...)
    const [productName, setProductName] = React.useState('');
 const [description, setDescription] = React.useState('');
 const [price, setPrice] = React.useState('');
 const [stockQuantity, setStockQuantity] = React.useState('');
 const [imageUrl, setImageUrl] = React.useState('');
 const [categoryId, setCategoryId] = React.useState('');
 const [categories, setCategories] = React.useState([]);

    // === State cho loading/error ===
 const [loading, setLoading] = React.useState(false); // Loading cho submit
 const [error, setError] = React.useState('');
 const [success, setSuccess] = React.useState('');
    // 3. THÊM STATE LOADING CHO VIỆC TẢI DỮ LIỆU CŨ
 const [pageLoading, setPageLoading] = React.useState(true); // Loading cho cả trang

 // --- useEffect để Lấy danh sách Danh mục (Giữ nguyên) ---
 React.useEffect(() => {
  if (!user) return;
        if (user.role !== 'Admin') {
   setError('Bạn không có quyền truy cập trang này.');
            setPageLoading(false); // Dừng loading trang
   return;
        }
  const fetchCategories = async () => {
   try {
    const { data } = await axios.get('http://localhost:5000/api/products/categories/all');
    setCategories(data);
   } catch (err) {
    console.error("Lỗi tải danh mục:", err);
    setError('Không thể tải danh sách danh mục.');
   } 
  };
  fetchCategories();
 }, [user]); 

    // --- 4. THÊM useEffect ĐỂ LẤY THÔNG TIN SẢN PHẨM CŨ ---
    React.useEffect(() => {
        const fetchProductDetails = async () => {
            if (user?.role === 'Admin') {
                try {
                    setError('');
                    setPageLoading(true);
                    // Dùng API public để lấy chi tiết sản phẩm
                    const { data } = await axios.get(`http://localhost:5000/api/products/${productId}`);
                    
                    // Điền thông tin cũ vào form
                    setProductName(data.ProductName);
                    setDescription(data.Description || '');
                    setPrice(data.Price);
                    setStockQuantity(data.StockQuantity);
                    setImageUrl(data.ImageUrl || '');
                    setCategoryId(data.CategoryID);

                } catch (err) {
                    console.error("Lỗi tải chi tiết sản phẩm:", err);
                    setError('Không thể tải chi tiết sản phẩm.');
                } finally {
                    setPageLoading(false); // Tải xong, dừng loading trang
                }
            }
        };

        fetchProductDetails();
    // Chạy lại khi user (Admin) đã sẵn sàng hoặc productId thay đổi
    }, [user, productId]);


 // --- 5. SỬA HÀM handleSubmit ĐỂ DÙNG "PUT" (Sửa) ---
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true); 

  if (!token || user?.role !== 'Admin') {
   setError('Xác thực thất bại.');
   setLoading(false);
   return;
  }

        // Dùng tên biến camelCase (viết thường) như đã thống nhất
  const updatedProductData = {
   productName,
   description,
   price: parseFloat(price),
   stockQuantity: parseInt(stockQuantity, 10),
   imageUrl,
   categoryId: parseInt(categoryId, 10)
  };

  try {
   const config = {
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${token}`,
    },
   };
            
            // THAY ĐỔI CHÍNH: Dùng axios.put và URL có ${productId}
   await axios.put(
                `http://localhost:5000/api/admin/products/${productId}`, 
                updatedProductData, 
                config
            );

   setSuccess(`Đã cập nhật sản phẩm "${productName}"`);
            // Không reset form, chỉ hiển thị thành công
            // (Hoặc có thể điều hướng về trang danh sách)
            // navigate('/admin/products'); 

  } catch (err) {
   console.error('Lỗi khi cập nhật sản phẩm:', err);
   setError(err.response?.data?.message || 'Cập nhật sản phẩm thất bại.');
  } finally {
   setLoading(false);
  }
 };

 // --- Render Giao diện ---
 if (pageLoading) {
  return <div className="container loading-message">Đang tải dữ liệu sản phẩm...</div>;
 }
    if (!user || user.role !== 'Admin') {
         return <div className="container error-message">Bạn không có quyền truy cập trang này.</div>;
    }
    // Lỗi nghiêm trọng (ví dụ: không tải được danh mục hoặc sản phẩm)
    if (error && (!categories.length || !productName)) {
        return <div className="container error-message">{error}</div>;
    }


 return (
  <div className="container admin-create-product-page card-style">
            {/* 6. SỬA TIÊU ĐỀ */}
   <h2>Chỉnh sửa Sản phẩm (ID: {productId})</h2>

   {error && !success && <p className="error-message">{error}</p>}
   {success && <p className="success-message">{success}</p>}

   <form onSubmit={handleSubmit} className="product-form">
    {/* Các trường input (Giữ nguyên y hệt trang Thêm) */}
    <div className="form-group">
     <label htmlFor="productName">Tên Sản phẩm <span className="required">*</span></label>
     <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
    </div>
                
    <div className="form-group">
     <label htmlFor="description">Mô tả</label>
     <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
    </div>
                
    <div className="form-group">
     <label htmlFor="price">Giá (VND) <span className="required">*</span></label>
     <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" />
    </div>
                
    <div className="form-group">
     <label htmlFor="stockQuantity">Số lượng tồn kho <span className="required">*</span></label>
     <input type="number" id="stockQuantity" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required min="0" />
    </div>

    <div className="form-group">
     <label htmlFor="imageUrl">Tên file ảnh</label>
     <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Ví dụ: hat-royal-canin.jpg" />
    </div>

    <div className="form-group">
     <label htmlFor="category">Danh mục <span className="required">*</span></label>
     <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={!categories.length}>
      {!categories.length && <option value="" disabled>Đang tải...</option>}
      {categories.map(cat => (
       <option key={cat.CategoryID} value={cat.CategoryID}>
        {cat.CategoryName}
       </option>
      ))}
      tôi   </select>
    </div>

    <div className="form-actions">
     <button type="submit" className="btn btn-primary" disabled={loading}>
                        {/* 7. SỬA TÊN NÚT */}
      {loading ? 'Đang lưu...' : 'Cập nhật Sản phẩm'}
     </button>
     
                        {/* 8. SỬA LINK QUAY LẠI */}
                        <Link to="/admin/products" className="btn btn-secondary">
       Quay lại DS Sản phẩm
      </Link>
     </div>
    </form>
  </div>
 );
}

export default AdminProductEditPage;