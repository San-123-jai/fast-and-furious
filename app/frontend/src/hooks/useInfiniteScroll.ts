import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasNextPage,
  isFetching,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px'
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetching) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetching, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleObserver, threshold, rootMargin]);

  return observerRef;
} 