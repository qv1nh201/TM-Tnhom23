// File này chỉ dùng để KIỂM TRA kết nối.
// Đây là bước ĐẦU TIÊN bạn phải chạy.

const sql = require('mssql');
const dbConfig = require('./config/dbConfig'); // Lấy config từ file kia

async function testConnection() {
    console.log('Đang thử kết nối đến SQL Server...');
    try {
        // Thử kết nối
        let pool = await sql.connect(dbConfig);
        console.log('✅✅✅ KẾT NỐI SQL SERVER THÀNH CÔNG!');

        // Thử truy vấn
        const result = await pool.request().query('SELECT * FROM Users');
        console.log('--- Dữ liệu mẫu từ bảng Users: ---');
        console.log(result.recordset);
        console.log('---------------------------------');

        await pool.close();
    } catch (err) {
        console.error('❌❌❌ LỖI KẾT NỐI CSDL:', err.message);
    }
}

// Chạy hàm test
testConnection();
