import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('karyana_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('karyana_cart_v2', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  function addToCart(item, quantity = 1, buyType = 'box') {
    const qty = Math.max(1, Number(quantity) || 1);
    const cartId = `${item._id}_${buyType}`;
    const unitsPerBox = item.unitsPerBox || 1;
    const maxQty = buyType === 'unit' ? Math.floor((item.boxesInStock || 0) * unitsPerBox) : (item.boxesInStock || 0);

    setCart((prev) => {
      const existing = prev.find((entry) => entry.cartId === cartId);
      if (existing) {
        const newQty = Math.min(maxQty, existing.quantity + qty);
        return prev.map((entry) =>
          entry.cartId === cartId
            ? { ...entry, quantity: newQty, item: { ...entry.item, ...item } }
            : entry
        );
      }
      return [...prev, { cartId, item, buyType, quantity: Math.min(maxQty, qty) }];
    });
  }

  function updateQuantity(cartId, quantity) {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((entry) => {
        if (entry.cartId === cartId) {
          const unitsPerBox = entry.item.unitsPerBox || 1;
          const maxQty = entry.buyType === 'unit'
            ? Math.floor((entry.item.boxesInStock || 999) * unitsPerBox)
            : (entry.item.boxesInStock || 999);
          return { ...entry, quantity: Math.min(maxQty, quantity) };
        }
        return entry;
      })
    );
  }

  function removeFromCart(cartId) {
    setCart((prev) => prev.filter((entry) => entry.cartId !== cartId));
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const cartUniqueCount = cart.length;

  const cartTotal = cart.reduce((sum, entry) => {
    const pricePerBox = entry.item.pricePerBox || 0;
    const unitsPerBox = entry.item.unitsPerBox || 1;
    const pricePerUnit = entry.item.pricePerUnit || Number((pricePerBox / unitsPerBox).toFixed(2));
    const rate = entry.buyType === 'unit' ? pricePerUnit : pricePerBox;
    return sum + (entry.quantity * rate);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartUniqueCount,
        cartTotal,
        orderReceipt,
        setOrderReceipt
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
