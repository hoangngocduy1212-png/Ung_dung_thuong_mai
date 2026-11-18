import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import type { CartData, CartItem } from '../../types/customer';

interface CartContextType {
  cart: CartData | null;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'techstore_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const data = await customerService.getCart();
        setCart(data);
      } catch {
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        if (stored) {
          setCart(JSON.parse(stored));
        } else {
          setCart({ items: [] });
        }
      } catch {
        setCart({ items: [] });
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, variantId: string, quantity: number = 1): Promise<boolean> => {
    try {
      if (isAuthenticated) {
        const updated = await customerService.addToCart(productId, variantId, quantity);
        setCart(updated);
        return true;
      } else {
        // Guest cart
        const currentItems = cart?.items || [];
        const existingIndex = currentItems.findIndex(
          (i) => (i.product?._id || (i.product as any)) === productId && (i.variant?._id || (i.variant as any)) === variantId
        );
        let newItems: CartItem[];
        if (existingIndex > -1) {
          newItems = [...currentItems];
          newItems[existingIndex].quantity += quantity;
        } else {
          newItems = [
            ...currentItems,
            {
              _id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              product: { _id: productId } as any,
              variant: { _id: variantId } as any,
              quantity,
            },
          ];
        }
        const newCart: CartData = { items: newItems };
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
        setCart(newCart);
        return true;
      }
    } catch {
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      if (isAuthenticated) {
        const updated = await customerService.updateCartItem(itemId, quantity);
        setCart(updated);
        return true;
      } else {
        const currentItems = cart?.items || [];
        const newItems = currentItems
          .map((i) => (i._id === itemId ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0);
        const newCart: CartData = { items: newItems };
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
        setCart(newCart);
        return true;
      }
    } catch {
      return false;
    }
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    try {
      if (isAuthenticated) {
        const updated = await customerService.removeCartItem(itemId);
        setCart(updated);
        return true;
      } else {
        const currentItems = cart?.items || [];
        const newItems = currentItems.filter((i) => i._id !== itemId);
        const newCart: CartData = { items: newItems };
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
        setCart(newCart);
        return true;
      }
    } catch {
      return false;
    }
  };

  const itemCount = (cart?.items || []).reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
