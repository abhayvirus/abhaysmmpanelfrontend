import { useCallback, useEffect, useRef, useState } from 'react';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
  } catch (_) {
    /* ignore */
  }
  return null;
}

/**
 * Draggable fixed-position float (touch + mouse). Clamps to viewport and persists position.
 */
export function useDraggableFloat({
  storageKey = 'abhaysmm_live_chat_fab_pos',
  size = 52,
  margin = 12,
  extraBottomReserve = 0,
  enabled = true,
} = {}) {
  const [position, setPosition] = useState(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const isMobileViewport = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
    []
  );

  const getBottomReserve = useCallback(() => {
    if (!isMobileViewport()) return margin + 8;
    const root = getComputedStyle(document.documentElement);
    const nav =
      parseFloat(root.getPropertyValue('--mobile-bottom-nav-h')) || 68;
    return nav + margin + 72 + (extraBottomReserve || 0);
  }, [isMobileViewport, margin, extraBottomReserve]);

  const getTopReserve = useCallback(() => {
    if (!isMobileViewport()) return margin;
    const header =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-header-h')) ||
      56;
    return header + margin;
  }, [isMobileViewport, margin]);

  const clampPosition = useCallback(
    (x, y) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const bottomR = getBottomReserve();
      const topR = getTopReserve();
      return {
        x: Math.min(Math.max(margin, x), Math.max(margin, w - size - margin)),
        y: Math.min(Math.max(topR, y), Math.max(topR, h - size - bottomR)),
      };
    },
    [getBottomReserve, getTopReserve, margin, size]
  );

  const getDefaultPosition = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bottomR = getBottomReserve();
    return clampPosition(w - size - margin, h - size - bottomR - 20);
  }, [clampPosition, getBottomReserve, margin, size]);

  const persist = useCallback(
    (pos) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(pos));
      } catch (_) {
        /* ignore */
      }
    },
    [storageKey]
  );

  useEffect(() => {
    if (!enabled) return;
    const stored = readStorage(storageKey);
    const initial = stored ? clampPosition(stored.x, stored.y) : getDefaultPosition();
    setPosition(initial);
  }, [enabled, storageKey, clampPosition, getDefaultPosition]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : getDefaultPosition()));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled, clampPosition, getDefaultPosition]);

  useEffect(() => {
    if (!enabled) return;
    setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : getDefaultPosition()));
  }, [enabled, extraBottomReserve, clampPosition, getDefaultPosition]);

  const setPositionSafe = useCallback(
    (x, y) => {
      const next = clampPosition(x, y);
      setPosition(next);
      persist(next);
      return next;
    },
    [clampPosition, persist]
  );

  const onPointerDown = (e) => {
    if (!enabled || !position) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragRef.current.moved = true;
    setPosition(clampPosition(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  const endDrag = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    setPosition((prev) => {
      if (!prev) return prev;
      const next = clampPosition(prev.x, prev.y);
      persist(next);
      return next;
    });
  };

  const wasDragged = () => dragRef.current.moved;

  const style =
    position != null
      ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
      : { visibility: 'hidden' };

  return {
    position,
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    wasDragged,
    setPositionSafe,
    clampPosition,
    getBottomReserve,
    size,
  };
}
