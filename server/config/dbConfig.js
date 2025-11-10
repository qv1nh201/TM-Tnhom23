require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'petstore_use',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'DESKTOP-SHD5BET', // ⚠️ phải là string, đúng instance name
  database: process.env.DB_NAME || 'PetStoreDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Tạo và export connection pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Kết nối SQL Server thành công');
    return pool;
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối SQL Server:', err);
    throw err;
  });

module.exports = { sql, poolPromise };
