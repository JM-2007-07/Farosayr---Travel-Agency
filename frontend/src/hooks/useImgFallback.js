import { useState, useCallback } from 'react';

/**
 * Ports the original:
 *   function handleImgError(img) {
 *     const wrap = img.closest('.img-wrap');
 *     if (wrap) wrap.classList.add('img-fallback');
 *   }
 *
 * Used as: const [broken, onError] = useImgFallback();
 *          <div className={`img-wrap ${broken ? 'img-fallback' : ''}`}>
 *            <img onError={onError} ... />
 */
export function useImgFallback() {
  const [broken, setBroken] = useState(false);
  const onError = useCallback(() => setBroken(true), []);
  return [broken, onError];
}
