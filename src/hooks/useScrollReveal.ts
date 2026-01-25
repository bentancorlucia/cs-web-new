"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "flip-up"
  | "flip-down";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const animationStyles: Record<
  AnimationType,
  { initial: string; revealed: string }
> = {
  "fade-up": {
    initial: "opacity: 0; transform: translateY(30px);",
    revealed: "opacity: 1; transform: translateY(0);",
  },
  "fade-down": {
    initial: "opacity: 0; transform: translateY(-30px);",
    revealed: "opacity: 1; transform: translateY(0);",
  },
  "fade-left": {
    initial: "opacity: 0; transform: translateX(-30px);",
    revealed: "opacity: 1; transform: translateX(0);",
  },
  "fade-right": {
    initial: "opacity: 0; transform: translateX(30px);",
    revealed: "opacity: 1; transform: translateX(0);",
  },
  "zoom-in": {
    initial: "opacity: 0; transform: scale(0.9);",
    revealed: "opacity: 1; transform: scale(1);",
  },
  "zoom-out": {
    initial: "opacity: 0; transform: scale(1.1);",
    revealed: "opacity: 1; transform: scale(1);",
  },
  "flip-up": {
    initial: "opacity: 0; transform: perspective(600px) rotateX(20deg);",
    revealed: "opacity: 1; transform: perspective(600px) rotateX(0);",
  },
  "flip-down": {
    initial: "opacity: 0; transform: perspective(600px) rotateX(-20deg);",
    revealed: "opacity: 1; transform: perspective(600px) rotateX(0);",
  },
};

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    animation = "fade-up",
    delay = 0,
    duration = 600,
    once = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      return;
    }

    const styles = animationStyles[animation];

    // Set initial styles
    element.style.cssText += `
      ${styles.initial}
      transition: opacity ${duration}ms ease-out, transform ${duration}ms ease-out;
      transition-delay: ${delay}ms;
    `;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply revealed styles
            const el = entry.target as HTMLElement;
            el.style.cssText += styles.revealed;
            el.classList.add("reveal");

            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            // Reset to initial state if not once
            const el = entry.target as HTMLElement;
            el.style.cssText += styles.initial;
            el.classList.remove("reveal");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, animation, delay, duration, once]);

  return ref;
}

// Hook for staggered reveal of multiple elements
export function useStaggeredReveal(
  count: number,
  baseDelay: number = 100,
  options: Omit<UseScrollRevealOptions, "delay"> = {}
) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const setRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? "0px 0px -50px 0px",
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  const getItemProps = useCallback(
    (index: number) => ({
      ref: setRef(index),
      style: {
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity ${options.duration ?? 600}ms ease-out, transform ${options.duration ?? 600}ms ease-out`,
        transitionDelay: `${index * baseDelay}ms`,
      },
    }),
    [isInView, baseDelay, setRef, options.duration]
  );

  return {
    containerRef,
    getItemProps,
    isInView,
  };
}
