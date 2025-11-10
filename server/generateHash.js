// File này dùng để tạo hash mới cho mật khẩu

const bcrypt = require('bcryptjs');
const passwordToHash = '123456'; // Mật khẩu bạn muốn mã hóa

async function createHash() {
    try {
        const salt = await bcrypt.genSalt(10); // Tạo salt (10 vòng)
        const hashedPassword = await bcrypt.hash(passwordToHash, salt); // Mã hóa mật khẩu

        console.log(`Mật khẩu gốc: ${passwordToHash}`);
        console.log('---');
        console.log('HASH MỚI (Copy dòng dưới đây):');
        console.log(hashedPassword); // In ra chuỗi hash mới
        console.log('---');

    } catch (error) {
        console.error('Lỗi khi tạo hash:', error);
    }
}

createHash();