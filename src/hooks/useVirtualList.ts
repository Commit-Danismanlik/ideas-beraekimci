import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

export interface UseVirtualListOptions {
  itemHeight: number; // px
  containerHeight: number; // px
  overscan?: number; // item count
}

export interface UseVirtualListResult {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetTop: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useVirtualList = (itemCount: number, options: UseVirtualListOptions): UseVirtualListResult => {
  const { itemHeight, containerHeight, overscan = 6 } = options;
  const [scrollTop, setScrollTop] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = useMemo(() => itemCount * itemHeight, [itemCount, itemHeight]);

  const startIndex = useMemo(() => {
    const raw = Math.floor(scrollTop / itemHeight) - overscan;
    return raw < 0 ? 0 : raw;
  }, [scrollTop, itemHeight, overscan]);

  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;

  const endIndex = useMemo(() => {
    const idx = startIndex + visibleCount;
    return idx > itemCount ? itemCount : idx;
  }, [startIndex, visibleCount, itemCount]);

  const offsetTop = useMemo(() => startIndex * itemHeight, [startIndex, itemHeight]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  useEffect(() => {
    // Reset scroll when list shrinks drastically
    if (containerRef.current && totalHeight < containerRef.current.scrollTop) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [totalHeight]);

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetTop,
    onScroll,
    containerRef,
  };
};


