// ... (Code Footer giữ nguyên như trước) ...
import React from 'react';
import '../App.css'; // Sử dụng CSS chung

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-columns">
                {/* Cột 1: Thông tin */}
                <div className="footer-column">
                    <h4>Thông tin Công ty</h4>
                    <ul>
                        <li><a href="#">Giới thiệu Pet Store</a></li>
                        <li><a href="#">Điều khoản sử dụng</a></li>
                        <li><a href="#">Chính sách bảo mật</a></li>
                        <li><a href="#">Tuyển dụng</a></li>
                    </ul>
                </div>

                {/* Cột 2: Hỗ trợ */}
                <div className="footer-column">
                    <h4>Hỗ trợ Khách hàng</h4>
                    <ul>
                        <li><a href="#">Hướng dẫn mua hàng</a></li>
                        <li><a href="#">Chính sách đổi trả</a></li>
                        <li><a href="#">Câu hỏi thường gặp (FAQ)</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Cột 3: Cửa hàng */}
                <div className="footer-column">
                    <h4>Hệ thống Cửa hàng</h4>
                    <p><strong>Chi nhánh 1:</strong> 123 Đường ABC, Q.1, TP.HCM</p>
                    <p><strong>Chi nhánh 2:</strong> 456 Đường XYZ, Q. Bình Thạnh, TP.HCM</p>
                    <p><strong>Hotline:</strong> 1800 1234</p>
                </div>

                 {/* Cột 4: Mạng xã hội */}
                 <div className="footer-column">
                    <h4>Kết nối với chúng tôi</h4>
                    {/* Thêm icons mạng xã hội */}
                    <a href="#" style={{marginRight: '10px'}}>Facebook</a>
                    <a href="#">Instagram</a>
                 </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 Pet Store - Đồ án môn học. Phát triển bởi Nhóm S23.</p>
            </div>
        </footer>
    );
}

export default Footer;