'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Cart } from '@/types';
import { cartService } from '@/services/order.service';
import { useAuth } from './AuthContext';

const BUY_AGAIN_SESSION_KEY = 'buyAgainSession';

function isBuyAgainAllowedPath(pathname: string) {
  return pathname === '/cart' || pathname.startsWith('/checkout');
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  buyAgainSessionActive: boolean;
  refreshCart: () => Promise<void>;
  syncCart: (cart: Cart) => void;
  clearCart: () => Promise<void>;
  startBuyAgainSession: () => void;
  endBuyAgainSession: () => void;
  abandonBuyAgainSession: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function BuyAgainSessionWatcher({
  buyAgainSessionActive,
  abandonBuyAgainSession,
}: {
  buyAgainSessionActive: boolean;
  abandonBuyAgainSession: () => Promise<void>;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (buyAgainSessionActive && !isBuyAgainAllowedPath(pathname)) {
      abandonBuyAgainSession();
    }
  }, [pathname, buyAgainSessionActive, abandonBuyAgainSession]);

  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [buyAgainSessionActive, setBuyAgainSessionActive] = useState(false);

  useEffect(() => {
    setBuyAgainSessionActive(sessionStorage.getItem(BUY_AGAIN_SESSION_KEY) === 'true');
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const startBuyAgainSession = useCallback(() => {
    sessionStorage.setItem(BUY_AGAIN_SESSION_KEY, 'true');
    setBuyAgainSessionActive(true);
  }, []);

  const endBuyAgainSession = useCallback(() => {
    sessionStorage.removeItem(BUY_AGAIN_SESSION_KEY);
    setBuyAgainSessionActive(false);
  }, []);

  const clearCart = useCallback(async () => {
    endBuyAgainSession();
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      const data = await cartService.clearCart();
      setCart(data);
    } catch {
      setCart((prev) => (prev ? { ...prev, items: [] } : null));
    }
  }, [isAuthenticated, endBuyAgainSession]);

  const abandonBuyAgainSession = useCallback(async () => {
    if (!sessionStorage.getItem(BUY_AGAIN_SESSION_KEY)) return;
    await clearCart();
  }, [clearCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    endBuyAgainSession();
    const data = await cartService.addItem(productId, quantity);
    setCart(data);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const data = await cartService.updateItem(productId, quantity);
    setCart(data);
  };

  const removeItem = async (productId: string) => {
    const data = await cartService.removeItem(productId);
    setCart(data);
  };

  const syncCart = useCallback((updatedCart: Cart) => {
    setCart(updatedCart);
  }, []);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        buyAgainSessionActive,
        refreshCart,
        syncCart,
        clearCart,
        startBuyAgainSession,
        endBuyAgainSession,
        abandonBuyAgainSession,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      <BuyAgainSessionWatcher
        buyAgainSessionActive={buyAgainSessionActive}
        abandonBuyAgainSession={abandonBuyAgainSession}
      />
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
