"use client";

/**
 * TiltCard — subtle 3D perspective card.
 *
 * - Desktop (hover-capable): pointer position drives a gentle rotateX/rotateY
 *   (max ~5deg) plus a soft cursor-following glow.
 * - Touch devices: tilt disabled via CSS (`@media (hover: none)`); the card
 *   keeps the regular press/hover feel.
 * - prefers-reduced-motion: tilt disabled in JS as well.
 * - Tilt values are written as CSS variables (--tilt-x/--tilt-y) which the
 *   nested .scene-actor consumes for pointer parallax on the 3D visuals.
 *
 * Pure presentation — no data, no routing.
 */

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max tilt in degrees. Keep subtle. */
  maxTilt?: number;
  /** Disable the pointer-following glow. */
  noGlow?: boolean;
}

export function TiltCard({
  className,
  children,
  maxTilt = 5,
  noGlow = false,
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pending = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const flushScheduled = useRef(false);
  const [glow, setGlow] = useState<{ x: string; y: string } | null>(null);

  const flush = useCallback(() => {
    flushScheduled.current = false;
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    pending.current = null;
    el.style.setProperty("--tilt-x", `${p.x.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${p.y.toFixed(2)}deg`);
    if (!noGlow) setGlow({ x: `${(p.px * 100).toFixed(1)}%`, y: `${(p.py * 100).toFixed(1)}%` });
  }, [noGlow]);

  const schedule = useCallback(() => {
    if (flushScheduled.current) return;
    flushScheduled.current = true;
    // Prefer rAF coalescing when the browser runs frames; otherwise flush
    // directly (some embedded/occluded webviews throttle rAF to zero).
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(flush);
    } else {
      flush();
    }
  }, [flush]);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    pending.current = null;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    setGlow(null);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const y = (px - 0.5) * 2 * maxTilt; // rotateY
      const x = (0.5 - py) * 2 * maxTilt; // rotateX

      pending.current = { x, y, px, py };
      schedule();
    },
    [maxTilt, schedule]
  );

  return (
    <div
      ref={ref}
      className={cn("tilt-wrap", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      {...props}
    >
      <div className="tilt-card relative h-full">
        {glow && !noGlow && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 transition-opacity"
            style={{
              background: `radial-gradient(9rem circle at ${glow.x} ${glow.y}, hsl(174 80% 60% / 0.14), transparent 70%)`,
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
