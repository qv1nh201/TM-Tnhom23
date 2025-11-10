import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function AdminProductCreatePage() {
  const { user, token } = useAuth() ?? {};
  const navigate = useNavigate();

  // form fields
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');       // fallback khi không upload file
  const [categoryId, setCategoryId] = useState('');

  // categories
  const [categories, setCategories] = useState([]);

  // upload file state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  // ui states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // -------- load categories (chỉ khi user sẵn sàng) --------
  useEffect(() => {
    if (!user) return;

    if (user.role !== 'Admin') {
      setError('Bạn không có quyền truy cập trang này.');
      setInitialLoading(false);
      return;
    }

    const fetchCategories = async () => {
      setInitialLoading(true);
      setError('');
      try {
        const { data } = await axios.get('http://localhost:5000/api/products/categories/all');
        setCategories(data || []);
        // set mặc định category đầu tiên nếu chưa chọn
        if ((data || []).length > 0) {
          setCategoryId(prev => (prev ? prev : data[0].CategoryID));
        } else {
          setError('Chưa có danh mục nào. Vui lòng tạo danh mục trước.');
        }
      } catch (e) {
        console.error('Lỗi tải danh mục:', e);
        setError('Không thể tải danh sách danh mục.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  // -------- file change handler --------
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : '');
  };

  // -------- submit handler (FormData + multer) --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!token || user?.role !== 'Admin') {
        throw new Error('Xác thực thất bại hoặc bạn không phải Admin.');
      }
      if (!categoryId) {
        throw new Error('Vui lòng chọn một danh mục.');
      }

      const form = new FormData();
      form.append('productName', productName);
      form.append('description', description || '');
      form.append('price', String(parseFloat(price || '0')));
      form.append('stockQuantity', String(parseInt(stockQuantity || '0', 10)));
      form.append('categoryId', String(parseInt(categoryId, 10)));

      if (file) {
        // tên field phải là "image" để khớp upload.single('image') ở server
        form.append('image', file);
      } else if (imageUrl) {
        // fallback: nếu không upload file thì vẫn cho nhập sẵn URL/đường dẫn
        form.append('imageUrl', imageUrl);
      }

      const { data } = await axios.post(
        // dùng route đã gắn multer trong productRoutes
        'http://localhost:5000/api/products',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // KHÔNG set 'Content-Type'; để axios tự set boundary
          },
        }
      );

      setSuccess(`Đã thêm sản phẩm "${productName}"`);
      // reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setStockQuantity('');
      setImageUrl('');
      setFile(null);
      setPreview('');
      if (categories.length > 0) setCategoryId(categories[0].CategoryID);

      // (tuỳ chọn) điều hướng về danh sách
      // navigate('/admin/products');
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      setError(err.response?.data?.message || err.message || 'Thêm sản phẩm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // -------- render guards --------
  if (initialLoading && !user) {
    return <div className="container loading-message">Đang kiểm tra quyền truy cập...</div>;
  }
  if (!user || user.role !== 'Admin') {
    return <div className="container error-message">Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.</div>;
  }
  if (error && categories.length === 0) {
    return <div className="container error-message">{error}</div>;
  }

  // -------- render form --------
  return (
    <div className="container admin-create-product-page card-style">
      <h2>Thêm Sản phẩm mới</h2>

      {error && !success && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="product-form">
        {/* Tên sản phẩm */}
        <div className="form-group">
          <label htmlFor="productName">Tên Sản phẩm <span className="required">*</span></label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Mô tả */}
        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Giá */}
        <div className="form-group">
          <label htmlFor="price">Giá (VND) <span className="required">*</span></label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>

        {/* Số lượng tồn */}
        <div className="form-group">
          <label htmlFor="stockQuantity">Số lượng tồn kho <span className="required">*</span></label>
          <input
            type="number"
            id="stockQuantity"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            required
            min="0"
          />
        </div>

        {/* Ảnh (browse) */}
        <div className="form-group">
          <label>Ảnh sản phẩm (browse từ máy)</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {preview && (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" style={{ maxWidth: 220, borderRadius: 8 }} />
            </div>
          )}
          <small><i>Nếu không chọn ảnh, bạn có thể nhập sẵn đường dẫn ở ô bên dưới.</i></small>
        </div>

        {/* Đường dẫn ảnh (fallback khi không upload file) */}
        <div className="form-group">
          <label htmlFor="imageUrl">Đường dẫn ảnh có sẵn (tùy chọn)</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="VD: /uploads/xxx.png hoặc URL ngoài"
          />
        </div>

        {/* Danh mục */}
        <div className="form-group">
          <label htmlFor="category">Danh mục <span className="required">*</span></label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={categories.length === 0}
          >
            {categories.map(cat => (
              <option key={cat.CategoryID} value={cat.CategoryID}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || categories.length === 0}
          >
            {loading ? 'Đang lưu...' : 'Thêm Sản phẩm'}
          </button>

          <Link to="/admin/products" className="btn btn-secondary">
            Quay lại
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminProductCreatePage;
