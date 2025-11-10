const { sql, poolPromise } = require('../config/dbConfig');

// ==============================
// 🛒 TẠO ĐƠN HÀNG MỚI
// ==============================
exports.createOrder = async (req, res) => {
  const { shippingAddress, phoneNumber, orderItems } = req.body;
  console.log("📦 DỮ LIỆU NHẬN TỪ CLIENT:", JSON.stringify(req.body, null, 2));

  // Chuẩn hóa items: chấp nhận Quantity/quantity, ProductID/productId
  const items = (orderItems || []).map(x => ({
    ProductID: Number(x.ProductID ?? x.productId),
    Quantity: Number(x.Quantity ?? x.quantity),
  }));

  // Lấy userId từ token (UserID hoặc userId)
  const userId = Number(req.user?.UserID ?? req.user?.userId);

  // Validate
  if (!userId) {
    return res.status(401).json({ message: "Thiếu thông tin người dùng (token không hợp lệ)." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống, không thể tạo đơn hàng." });
  }
  if (items.some(i => !i.ProductID || !Number.isFinite(i.Quantity) || i.Quantity <= 0)) {
    return res.status(400).json({ message: "Dữ liệu sản phẩm không hợp lệ (ProductID/Quantity)." });
  }

  let transaction;
  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    let total = 0;

    // Kiểm tra tồn kho và trừ kho (dùng ISNULL để tránh NULL)
    for (const it of items) {
      const lockRes = await new sql.Request(transaction)
        .input("ProductID", sql.Int, it.ProductID)
        .query(`
          SELECT ProductID, ProductName, Price, StockQuantity
          FROM Products WITH (ROWLOCK, UPDLOCK)
          WHERE ProductID = @ProductID AND IsAvailable = 1
        `);

      if (lockRes.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: `Không tìm thấy sản phẩm #${it.ProductID}` });
      }

      const p = lockRes.recordset[0];
      const currentStock = Number(p.StockQuantity ?? 0);

      if (currentStock < it.Quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm "${p.ProductName}" không đủ tồn kho (còn ${currentStock}, cần ${it.Quantity}).`
        });
      }

      // Trừ kho an toàn
      await new sql.Request(transaction)
        .input("ProductID", sql.Int, it.ProductID)
        .input("Qty", sql.Int, it.Quantity)
        .query(`
          UPDATE Products 
          SET StockQuantity = ISNULL(StockQuantity, 0) - @Qty 
          WHERE ProductID = @ProductID
        `);

      total += Number(p.Price) * it.Quantity;
      it._unitPrice = p.Price; // lưu giá để insert OrderItems
    }

    // Tạo đơn hàng chính
    const orderRes = await new sql.Request(transaction)
      .input("UserID", sql.Int, userId)
      .input("TotalAmount", sql.Decimal(10, 2), total)
      .input("ShippingAddress", sql.NVarChar, shippingAddress || null)
      .input("PhoneNumber", sql.NVarChar, phoneNumber || null)
      .query(`
        INSERT INTO Orders (UserID, TotalAmount, ShippingAddress, PhoneNumber, Status, OrderDate)
        OUTPUT INSERTED.OrderID
        VALUES (@UserID, @TotalAmount, @ShippingAddress, @PhoneNumber, 'Pending', GETDATE())
      `);

    const orderId = orderRes.recordset[0].OrderID;

    // Thêm chi tiết đơn hàng
    for (const it of items) {
      await new sql.Request(transaction)
        .input("OrderID", sql.Int, orderId)
        .input("ProductID", sql.Int, it.ProductID)
        .input("Quantity", sql.Int, it.Quantity)
        .input("Price", sql.Decimal(10, 2), it._unitPrice)
        .query(`
          INSERT INTO OrderItems (OrderID, ProductID, Quantity, Price)
          VALUES (@OrderID, @ProductID, @Quantity, @Price)
        `);
    }

    await transaction.commit();
    return res.status(201).json({ message: "Tạo đơn hàng thành công", orderId, total });
  } catch (err) {
    if (transaction) { try { await transaction.rollback(); } catch (_) {} }
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo đơn hàng", error: err.message });
  }
};

// ==============================
// 📦 LẤY CÁC ĐƠN HÀNG CỦA NGƯỜI DÙNG
// ==============================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = Number(req.user?.UserID ?? req.user?.userId);
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT 
          o.OrderID, 
          o.OrderDate, 
          o.Status, 
          o.TotalAmount,
          o.ShippingAddress,
          o.PhoneNumber
        FROM Orders o
        WHERE o.UserID = @UserID
        ORDER BY o.OrderDate DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi khi lấy đơn hàng người dùng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy đơn hàng', error: err.message });
  }
};

// ==============================
// 📑 LẤY CHI TIẾT 1 ĐƠN HÀNG
// ==============================
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;

  try {
    const pool = await poolPromise;

    const orderInfo = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .query(`
        SELECT 
          o.OrderID, 
          o.OrderDate, 
          o.Status, 
          o.TotalAmount,
          o.ShippingAddress,
          o.PhoneNumber,
          u.Username
        FROM Orders o
        JOIN Users u ON o.UserID = u.UserID
        WHERE o.OrderID = @OrderID
      `);

    if (orderInfo.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    const orderItems = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .query(`
        SELECT 
          od.ProductID, 
          p.ProductName, 
          od.Quantity, 
          od.Price
        FROM OrderItems od
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE od.OrderID = @OrderID
      `);

    res.status(200).json({
      ...orderInfo.recordset[0],
      items: orderItems.recordset,
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết đơn hàng', error: err.message });
  }
};

// ==============================
// 🧭 LẤY TOÀN BỘ ĐƠN HÀNG (CHO ADMIN)
// ==============================
exports.getAllOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT 
          o.OrderID, 
          o.OrderDate, 
          o.Status, 
          o.TotalAmount,
          o.ShippingAddress,
          o.PhoneNumber,
          u.Username
        FROM Orders o
        JOIN Users u ON o.UserID = u.UserID
        ORDER BY o.OrderDate DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi khi lấy tất cả đơn hàng (admin):', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đơn hàng', error: err.message });
  }
};

// ==============================
// ⚙️ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ADMIN)
// ==============================
exports.updateOrderStatus = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const allowed = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }

  let transaction;
  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    const ordRes = await new sql.Request(transaction)
      .input("OrderID", sql.Int, orderId)
      .query(`SELECT OrderID, Status FROM Orders WITH (ROWLOCK, UPDLOCK) WHERE OrderID = @OrderID`);

    if (ordRes.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }
    const currentStatus = ordRes.recordset[0].Status;

    // Nếu hủy đơn → hoàn tồn kho (dùng ISNULL để tránh NULL)
    if (status === 'Cancelled' && currentStatus !== 'Cancelled') {
      const itemsRes = await new sql.Request(transaction)
        .input("OrderID", sql.Int, orderId)
        .query(`
          SELECT oi.ProductID, oi.Quantity
          FROM OrderItems oi
          WHERE oi.OrderID = @OrderID
        `);

      for (const row of itemsRes.recordset) {
        await new sql.Request(transaction)
          .input("ProductID", sql.Int, row.ProductID)
          .input("Qty", sql.Int, row.Quantity)
          .query(`
            UPDATE Products 
            SET StockQuantity = ISNULL(StockQuantity, 0) + @Qty 
            WHERE ProductID = @ProductID
          `);
      }
    }

    await new sql.Request(transaction)
      .input("OrderID", sql.Int, orderId)
      .input("NewStatus", sql.NVarChar, status)
      .query(`UPDATE Orders SET Status = @NewStatus, UpdatedAt = GETDATE() WHERE OrderID = @OrderID`);

    await transaction.commit();
    res.status(200).json({ message: `Đã cập nhật trạng thái đơn #${orderId} -> ${status}` });
  } catch (err) {
    if (transaction) { try { await transaction.rollback(); } catch (_) {} }
    console.error("❌ Lỗi cập nhật trạng thái đơn:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái đơn hàng", error: err.message });
  }
};
