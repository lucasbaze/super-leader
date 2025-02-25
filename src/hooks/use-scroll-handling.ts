import { useCallback, useEffect, useState } from 'react';

interface UseScrollHandlingProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  messagesData?: any;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  scrollThreshold?: number;
}

export function useScrollHandling({
  containerRef,
  messagesData,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  scrollThreshold = 400
}: UseScrollHandlingProps) {
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Track scroll position to determine if we should auto-scroll new messages
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const isAtBottom =
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10;

      setShouldAutoScroll(isAtBottom);

      // Load more messages when scrolling near top
      if (
        container.scrollTop < scrollThreshold &&
        hasNextPage &&
        !isFetchingNextPage &&
        fetchNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, scrollThreshold]
  );

  // Auto-scroll to bottom when new messages arrive if we were already at the bottom
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [shouldAutoScroll, containerRef]);

  // Set initial scroll position to bottom when first loading messages
  useEffect(() => {
    if (messagesData) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [containerRef, messagesData]);

  return {
    handleScroll,
    shouldAutoScroll,
    setShouldAutoScroll
  };
}
