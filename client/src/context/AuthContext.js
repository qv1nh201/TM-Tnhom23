import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Đảm bảo đã cài jwt-decode
import axios from 'axios'; // Cần axios để set header mặc định

// 1. Tạo Context
const AuthContext = createContext();

// Hook tùy chỉnh để sử dụng Context
export const useAuth = () => {
    return useContext(AuthContext);
};

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // State lưu thông tin user (hoặc null)
    const [token, setToken] = useState(localStorage.getItem('userToken') || null); // State lưu token

    // Hàm set header Authorization mặc định cho axios
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // useEffect để kiểm tra token khi app khởi động hoặc token thay đổi
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Kiểm tra token hết hạn (exp tính bằng giây, Date.now() tính bằng ms)
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token hết hạn, đang đăng xuất...");
                    logout(); // Tự động đăng xuất nếu token hết hạn
                } else {
                    // Token hợp lệ, lưu thông tin user và set header axios
                    setUser({
                        userId: decoded.userId,
                        username: decoded.username || 'Người dùng', // Lấy username từ token
                        role: decoded.role
                    });
                    setAuthToken(token); // Set header cho các request sau
                    localStorage.setItem('userToken', token); // Đảm bảo token luôn được lưu
                }
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                logout(); // Đăng xuất nếu token lỗi
            }
        } else {
            // Không có token, đảm bảo user là null và xóa header
            setUser(null);
            setAuthToken(null);
            localStorage.removeItem('userToken');
        }
    }, [token]); // Chạy lại khi state token thay đổi

    // Hàm xử lý đăng nhập thành công
    const login = (newToken) => {
        setToken(newToken); // Cập nhật state token -> trigger useEffect ở trên
    };

    // Hàm xử lý đăng xuất
    const logout = () => {
        setToken(null); // Cập nhật state token thành null -> trigger useEffect
    };

    // Giá trị cung cấp bởi Context
    const value = {
        user, // Thông tin user { userId, username, role } hoặc null
        token, // Chuỗi token hoặc null
        login, // Hàm để gọi khi đăng nhập thành công
        logout // Hàm để gọi khi đăng xuất
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};