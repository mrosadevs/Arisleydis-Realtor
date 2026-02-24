"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type AnimationVariant = "fadeUp" | "fadeLeft" | "fadeRight" | "scaleIn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: AnimationVariant;
};

const variantClassMap: Record<AnimationVariant, string> = {
  fadeUp: "reveal",
  fadeLeft: "reveal-left",
  fadeRight: "reveal-right",
  scaleIn: "reveal-scale"
};

export function Reveal({ children, className, delayMs = 0, variant = "fadeUp" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        window.setTimeout(() => {
          setVisible(true);
        }, delayMs);

        observer.disconnect();
      },
      { threshold: 0.12 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [delayMs]);

  const baseClass = variantClassMap[variant];

  return (
    <div ref={ref} className={`${baseClass} ${visible ? "is-visible" : ""} ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
