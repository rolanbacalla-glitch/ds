"use client";

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SlidingTabListProps {
  activeKey: string;
  ariaLabel: string;
  className?: string;
  indicatorClassName?: string;
  children: React.ReactNode;
}

/**
 * Accessible segmented tablist with a spring-animated sliding active pill.
 * Automatically tracks both equal-width and variable-width (even wrapping) tabs.
 */
export const SlidingTabList: React.FC<SlidingTabListProps> = ({
  activeKey,
  ariaLabel,
  className,
  indicatorClassName,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
    animate: boolean;
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false, animate: false });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!activeEl) return;

    setIndicator((prev) => ({
      left: activeEl.offsetLeft,
      top: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
      ready: true,
      animate: prev.ready,
    }));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [activeKey, measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(container);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => measure());
    }

    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn("relative", className)}
    >
      {indicator.ready && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 left-0 rounded-md bg-[var(--sys-primary)] shadow-xs",
            indicatorClassName
          )}
          style={{
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
            transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)`,
            transition: indicator.animate
              ? "transform 280ms var(--ease-spatial-spring), width 280ms var(--ease-spatial-spring), height 280ms var(--ease-spatial-spring)"
              : "none",
          }}
        />
      )}
      {children}
    </div>
  );
};
