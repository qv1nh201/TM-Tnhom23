import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; 
import { useAuth } from '../context/AuthContext'; // <<< THÊM useAuth

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // <<< LẤY HÀM login TỪ AuthContext

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            const { data } = await axios.post(
                'http://localhost:5000/api/auth/login',
                { username, password },
                config
            );

            // === SỬA LỖI: Gọi hàm login từ Context ===
            login(data.token); // Gọi hàm login của AuthContext, nó sẽ tự lưu token và cập nhật user state

            setLoading(false);
            alert('Đăng nhập thành công!');
            navigate('/'); // Dùng navigate vì AuthContext sẽ cập nhật Navbar

        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            console.error('Lỗi đăng nhập:', err);
        }
    };

    return (
        <div className="container auth-form"> 
            <h2>Đăng nhập</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                 {/* Input fields giữ nguyên */}
                 <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Mật khẩu:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
            <p style={{ marginTop: '15px' }}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
}

export default LoginPage;