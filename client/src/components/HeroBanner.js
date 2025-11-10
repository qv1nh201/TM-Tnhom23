    import React from 'react';
    // Đảm bảo bạn đã chạy: npm install react-slick slick-carousel
    import Slider from "react-slick"; 
    
    // Import CSS của slick-carousel (Quan trọng! Phải có trong index.js hoặc App.js)
    // import "slick-carousel/slick/slick.css"; 
    // import "slick-carousel/slick/slick-theme.css";

    // Đảm bảo đường dẫn này đúng: Từ /components đi ra /src rồi vào App.css
    import '../App.css'; 

    function HeroBanner() {
        // Cài đặt cho slider (Giữ nguyên)
        const settings = {
            dots: true, 
            infinite: true, 
            speed: 500, 
            slidesToShow: 1, 
            slidesToScroll: 1, 
            autoplay: true, 
            autoplaySpeed: 3000, 
            arrows: true 
        };

        // Danh sách các ảnh banner (Giữ nguyên)
        const banners = [
            { id: 1, src: "/images/banner1.jpg", alt: "Khuyến mãi 1" },
            { id: 2, src: "/images/banner2.jpg", alt: "Khuyến mãi 2" },
            { id: 3, src: "/images/banner3.jpeg", alt: "Khuyến mãi 3" },
        ];

        return (
            <div className="hero-banner-slider"> 
                <Slider {...settings}>
                    {banners.map((banner) => (
                        <div key={banner.id}> 
                            <img 
                                src={banner.src} 
                                alt={banner.alt} 
                                style={{ width: '100%', display: 'block' }} 
                                onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png'; }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        );
    }

    export default HeroBanner;

