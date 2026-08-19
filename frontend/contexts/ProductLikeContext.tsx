'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ProductLikeEntry = {
  likeCount: number;
  likedByCurrentUser: boolean;
  interacted?: boolean;
};

type ProductLikeSeed = {
  _id: string;
  likeCount?: number;
  likedByCurrentUser?: boolean;
};

type ProductLikeContextValue = {
  getLikeState: (productId: string) => ProductLikeEntry | undefined;
  seedProducts: (products: ProductLikeSeed[]) => void;
  setLikeState: (productId: string, state: Omit<ProductLikeEntry, 'interacted'> & { interacted?: boolean }) => void;
};

const ProductLikeContext = createContext<ProductLikeContextValue | undefined>(undefined);

export function ProductLikeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [likesByProductId, setLikesByProductId] = useState<Record<string, ProductLikeEntry>>({});
  const userIdRef = useRef(user?.id);

  useEffect(() => {
    if (userIdRef.current === user?.id) return;

    userIdRef.current = user?.id;
    setLikesByProductId((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((productId) => {
        next[productId] = { ...next[productId], interacted: false };
      });
      return next;
    });
  }, [user?.id]);

  const getLikeState = useCallback(
    (productId: string) => likesByProductId[productId],
    [likesByProductId],
  );

  const seedProducts = useCallback((products: ProductLikeSeed[]) => {
    if (products.length === 0) return;

    setLikesByProductId((prev) => {
      const next = { ...prev };

      for (const product of products) {
        const existing = next[product._id];
        const likeCount = Math.max(
          0,
          product.likeCount !== undefined ? product.likeCount : (existing?.likeCount ?? 0),
        );
        const likedByCurrentUser = existing?.interacted
          ? existing.likedByCurrentUser
          : product.likedByCurrentUser ?? existing?.likedByCurrentUser ?? false;

        next[product._id] = {
          likeCount,
          likedByCurrentUser,
          interacted: existing?.interacted ?? false,
        };
      }

      return next;
    });
  }, []);

  const setLikeState = useCallback((
    productId: string,
    state: Omit<ProductLikeEntry, 'interacted'> & { interacted?: boolean },
  ) => {
    setLikesByProductId((prev) => ({
      ...prev,
      [productId]: {
        likeCount: Math.max(0, state.likeCount),
        likedByCurrentUser: state.likedByCurrentUser,
        interacted: state.interacted ?? true,
      },
    }));
  }, []);

  const value = useMemo(
    () => ({ getLikeState, seedProducts, setLikeState }),
    [getLikeState, seedProducts, setLikeState],
  );

  return (
    <ProductLikeContext.Provider value={value}>
      {children}
    </ProductLikeContext.Provider>
  );
}

export function useProductLikeContext() {
  const context = useContext(ProductLikeContext);
  if (!context) {
    throw new Error('useProductLikeContext must be used within ProductLikeProvider');
  }
  return context;
}
