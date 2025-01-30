'use client';

import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface DragHandleProps {
  onWidthChange: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function DragHandle({ onWidthChange, initialWidth = 400, minWidth = 300, maxWidth = 800 }: DragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(initialWidth);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = e.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
      onWidthChange(newWidth);
    },
    [isDragging, maxWidth, minWidth, onWidthChange, startWidth, startX]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn('hover:cursor-col-resize hover:bg-accent', 'mx-1 w-1 transition-colors', isDragging && 'bg-accent')}
      onMouseDown={handleMouseDown}
    />
  );
}
