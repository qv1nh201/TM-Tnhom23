const { sql, poolPromise } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === Đăng ký tài khoản ===
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    const pool = await poolPromise;
    const userExists = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Username = @username OR Email = @email');

    if (userExists.recordset.length > 0) {
      return res.status(409).json({ message: 'Tên đăng nhập hoặc Email đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Users (Username, Email, PasswordHash) VALUES (@username, @email, @passwordHash)');

    console.log(`>>> Đăng ký thành công user: ${username}`);
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (err) {
    console.error('LỖI ĐĂNG KÝ:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: err.message });
  }
};

// === Đăng nhập ===
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập Tên đăng nhập và Mật khẩu' });
  }

  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Sai Tên đăng nhập hoặc Mật khẩu (user not found)' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai Tên đăng nhập hoặc Mật khẩu (password mismatch)' });
    }

    const tokenPayload = {
      userId: user.UserID,
      username: user.Username,
      role: user.Role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log(`>>> Đăng nhập thành công user: ${user.Username}`);
    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        userId: user.UserID,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role
      }
    });

  } catch (err) {
    console.error('LỖI ĐĂNG NHẬP:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: err.message });
  }
};
