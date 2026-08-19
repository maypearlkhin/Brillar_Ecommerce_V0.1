'use client';

import { useCallback, useEffect, useRef } from 'react';
import { productService } from '@/services/product.service';
import { useProductLikeContext } from '@/contexts/ProductLikeContext';

type UseProductLikeOptions = {
  isAuthenticated?: boolean;
  initialLiked?: boolean;
  onAuthRequired?: () => void;
};

export function useProductLike(
  productId: string,
  initialLikeCount = 0,
  options: UseProductLikeOptions = {},
) {
  const { isAuthenticated = false, initialLiked = false, onAuthRequired } = options;
  const { getLikeState, seedProducts, setLikeState } = useProductLikeContext();
  const updatingRef = useRef(false);

  useEffect(() => {
    seedProducts([{
      _id: productId,
      likeCount: initialLikeCount,
      likedByCurrentUser: isAuthenticated ? initialLiked : false,
    }]);
  }, [productId, initialLikeCount, initialLiked, isAuthenticated, seedProducts]);

  const cached = getLikeState(productId);
  const likeCount = cached?.likeCount ?? Math.max(0, initialLikeCount);
  const liked = isAuthenticated ? (cached?.likedByCurrentUser ?? initialLiked) : false;

  const toggleLike = useCallback(async (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (updatingRef.current) return;

    updatingRef.current = true;

    try {
      const result = await productService.updateLike(productId);
      setLikeState(productId, {
        likeCount: result.likeCount,
        likedByCurrentUser: result.liked,
        interacted: true,
      });
    } finally {
      updatingRef.current = false;
    }
  }, [isAuthenticated, onAuthRequired, productId, setLikeState]);

  return {
    liked,
    likeCount,
    toggleLike,
    canLike: isAuthenticated,
  };
}
