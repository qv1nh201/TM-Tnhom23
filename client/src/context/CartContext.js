import React, { createContext, useState, useEffect, useContext } from 'react';

// Tạo Context
const CartContext = createContext();

// Hook tùy chỉnh để dễ dàng sử dụng CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Tạo Provider Component (Component cha để bao bọc App)
export const CartProvider = ({ children }) => {
    // State để lưu các sản phẩm trong giỏ hàng
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
            return [];
        }
    });

    // Lưu giỏ hàng vào localStorage mỗi khi cartItems thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Lỗi khi lưu giỏ hàng vào localStorage:", error);
        }
    }, [cartItems]);

    // Hàm thêm sản phẩm vào giỏ hàng
    const addToCart = (productToAdd) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.ProductID === productToAdd.ProductID);
            if (existingItem) {
                // Tăng số lượng nếu sản phẩm đã có
                return prevItems.map(item =>
                    item.ProductID === productToAdd.ProductID
                        ? { ...item, quantity: (item.quantity || 0) + 1 } // Đảm bảo quantity là số
                        : item
                );
            } else {
                // Thêm sản phẩm mới với số lượng là 1
                return [...prevItems, { ...productToAdd, quantity: 1 }];
            }
        });
        alert(`${productToAdd.ProductName} đã được thêm vào giỏ hàng!`);
    };

    // Hàm xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.ProductID !== productId));
    };

    // Hàm cập nhật số lượng
    const updateQuantity = (productId, newQuantity) => {
        const quantity = Number(newQuantity); // Đảm bảo là số
        if (isNaN(quantity) || quantity <= 0) {
            // Nếu số lượng không hợp lệ hoặc <= 0, xóa item
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.ProductID === productId ? { ...item, quantity: quantity } : item
                )
            );
        }
    };

    // Hàm xóa toàn bộ giỏ hàng
    const clearCart = () => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
            setCartItems([]);
        }
    };

    // Hàm tính tổng tiền giỏ hàng
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.Price) || 0;
            const quantity = Number(item.quantity) || 0;
            return total + price * quantity;
        }, 0);
    };

    // Cung cấp state và các hàm cho component con
    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};