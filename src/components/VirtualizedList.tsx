import React, { memo, useMemo } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';

interface VirtualizedListProps<T> {
  items: readonly T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey: (item: T) => string;
  itemHeight: number; // px
  height: number; // container height px
  className?: string;
}

export const VirtualizedList = <T,>(props: VirtualizedListProps<T>) => {
  const { items, renderItem, itemKey, itemHeight, height, className } = props;

  const { startIndex, endIndex, totalHeight, offsetTop, onScroll, containerRef } = useVirtualList(items.length, {
    itemHeight,
    containerHeight: height,
    overscan: 8,
  });

  const visibleItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={className}
      style={{ height, overflowY: 'auto', position: 'relative', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetTop, left: 0, right: 0 }}>
          {visibleItems.map((item, idx) => (
            <div key={itemKey(item)} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList;


