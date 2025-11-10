// controllers/ProductController.js
const { sql, poolPromise } = require('../config/dbConfig');

/* ============================
   LẤY DANH SÁCH SẢN PHẨM (có lọc)
============================ */
const getAllProducts = async (req, res) => {
  const { category, keyword, minPrice, maxPrice, page, limit } = req.query;
  try {
    const pool = await poolPromise;
    let where = "WHERE p.IsAvailable = 1";
    const request = pool.request();

    if (category) {
      where += " AND p.CategoryID = @CategoryID";
      request.input("CategoryID", sql.Int, Number(category));
    }
    if (keyword) {
      where += " AND (p.ProductName LIKE @Keyword OR p.Description LIKE @Keyword)";
      request.input("Keyword", sql.NVarChar, `%${keyword}%`);
    }
    if (minPrice) {
      where += " AND p.Price >= @MinPrice";
      request.input("MinPrice", sql.Decimal(10, 2), Number(minPrice));
    }
    if (maxPrice) {
      where += " AND p.Price <= @MaxPrice";
      request.input("MaxPrice", sql.Decimal(10, 2), Number(maxPrice));
    }

    let sqlText = `
      SELECT 
        p.ProductID, p.ProductName, p.Description, p.Price,
        p.ImageUrl, p.StockQuantity, c.CategoryID, c.CategoryName
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      ${where}
      ORDER BY p.ProductID DESC
    `;

    if (page && limit) {
      const pNum = parseInt(page, 10);
      const pSize = parseInt(limit, 10);
      const offset = (pNum - 1) * pSize;
      if (pNum > 0 && pSize > 0) {
        sqlText += ` OFFSET ${offset} ROWS FETCH NEXT ${pSize} ROWS ONLY`;
      }
    }

    const result = await request.query(sqlText);
    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách sản phẩm", error: err.message });
  }
};

/* ============================
   LẤY CHI TIẾT 1 SẢN PHẨM
============================ */
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, Number(id))
      .query(`
        SELECT 
          p.ProductID, p.ProductName, p.Description, p.Price,
          p.ImageUrl, p.StockQuantity, c.CategoryID, c.CategoryName
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE p.ProductID = @ProductID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    return res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết sản phẩm", error: err.message });
  }
};

/* ============================
   LẤY TẤT CẢ DANH MỤC
============================ */
const getAllCategories = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName ASC');
    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh mục:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh mục sản phẩm", error: err.message });
  }
};

/* ============================
   LẤY DANH MỤC THEO ID (cho /categories/:id)
============================ */
const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await poolPromise;
    const r = await pool.request()
      .input('CategoryID', sql.Int, id)
      .query('SELECT CategoryID, CategoryName FROM Categories WHERE CategoryID=@CategoryID');
    if (r.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    return res.status(200).json(r.recordset[0]);
  } catch (e) {
    console.error('❌ Lỗi getCategoryById:', e);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: e.message });
  }
};

/* ============================
   (ADMIN) THÊM SẢN PHẨM
============================ */
const createProduct = async (req, res) => {
  const { productName, description, price, stockQuantity, categoryId } = req.body;
  // nếu upload file: lấy đường dẫn /uploads/filename
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || null);

  if (!productName || !price || !categoryId) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Tên, Giá, Danh mục)" });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductName', sql.NVarChar, productName)
      .input('Description', sql.NVarChar, description || '')
      .input('Price', sql.Decimal(10, 2), Number(price))
      .input('StockQuantity', sql.Int, Number(stockQuantity ?? 0))
      .input('CategoryID', sql.Int, Number(categoryId))
      .input('ImageUrl', sql.NVarChar, imageUrl)
      .query(`
        INSERT INTO Products (ProductName, Description, Price, StockQuantity, CategoryID, ImageUrl, IsAvailable)
        VALUES (@ProductName, @Description, @Price, @StockQuantity, @CategoryID, @ImageUrl, 1)
      `);

    return res.status(201).json({ message: "Thêm sản phẩm mới thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi thêm sản phẩm", error: err.message });
  }
};

/* ============================
   (ADMIN) CẬP NHẬT SẢN PHẨM
============================ */
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productName, description, price, stockQuantity, categoryId, imageUrl: imageUrlFromBody } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (imageUrlFromBody || null);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, Number(id))
      .input('ProductName', sql.NVarChar, productName)
      .input('Description', sql.NVarChar, description || '')
      .input('Price', sql.Decimal(10, 2), Number(price))
      .input('StockQuantity', sql.Int, Number(stockQuantity))
      .input('CategoryID', sql.Int, Number(categoryId))
      .input('ImageUrl', sql.NVarChar, imageUrl)
      .query(`
        UPDATE Products
        SET ProductName=@ProductName, Description=@Description, Price=@Price,
            StockQuantity=@StockQuantity, CategoryID=@CategoryID, ImageUrl=@ImageUrl
        WHERE ProductID=@ProductID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    return res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật sản phẩm", error: err.message });
  }
};

/* ============================
   (ADMIN) XÓA MỀM SẢN PHẨM
============================ */
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, Number(id))
      .query('UPDATE Products SET IsAvailable = 0 WHERE ProductID = @ProductID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa" });
    }
    return res.status(200).json({ message: "Đã xóa (ẩn) sản phẩm thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi xóa sản phẩm", error: err.message });
  }
};

/* ============================
   EXPORT
============================ */
module.exports = {
  getAllProducts,
  getProductById,
  getAllCategories,
  getCategoryById,
  createProduct,
  updateProduct,
  deleteProduct,
};
