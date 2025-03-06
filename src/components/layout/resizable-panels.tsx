'use client';

import { useCallback, useEffect, useState } from 'react';

import { DragHandle } from '@/components/ui/drag-handle';

const STORAGE_KEY = 'chat-width';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultWidth = 350,
  minWidth = 300,
  maxWidth = 800
}: ResizablePanelsProps) {
  const [chatWidth, setChatWidth] = useState(defaultWidth);

  useEffect(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth) {
      setChatWidth(Number(savedWidth));
    }
  }, []);

  const handleWidthChange = useCallback((width: number) => {
    setChatWidth(width);
    localStorage.setItem(STORAGE_KEY, width.toString());
  }, []);

  return (
    <div className='flex flex-1'>
      <div style={{ width: chatWidth }}>{leftPanel}</div>

      <DragHandle
        onWidthChange={handleWidthChange}
        initialWidth={chatWidth}
        minWidth={minWidth}
        maxWidth={maxWidth}
      />

      <div className='flex-1'>{rightPanel}</div>
    </div>
  );
}
