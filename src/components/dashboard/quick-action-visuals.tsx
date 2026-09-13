"use client";

/**
 * Quick-action 3D visual scenes — one small animated "world" per feature.
 *
 * Design language (v2 — geometry first):
 * - Objects are built from LAYERED GEOMETRY: extruded side faces, bevels,
 *   specular highlights, shaded undersides and grounded shadows. Gradients
 *   are used as shading on shapes, not as glow.
 * - Lighting ratio per object ≈ 70% geometry / 20% light+shadow / 10% glow.
 * - <VisualScene> is the shared stage: perspective, pointer parallax
 *   (inherits --tilt-x/--tilt-y from the parent TiltCard) and an
 *   IntersectionObserver that pauses all loops off-screen.
 * - Touch devices and prefers-reduced-motion pause everything (globals.css).
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared stage                                                       */
/* ------------------------------------------------------------------ */

export function VisualScene({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  /** Accessible description of the decorative scene. */
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: "40px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("scene-stage relative h-20 w-20 shrink-0", className)}
      data-paused={paused ? "true" : "false"}
      role="img"
      aria-label={label}
    >
      {/* No pedestal — the object IS the scene. Empty-box feeling removed. */}
      <div className="scene-actor absolute inset-0">{children}</div>
    </div>
  );
}

/** Travelling specular highlight (the visible "shine" crossing a surface). */
function Sheen({ className, duration }: { className?: string; duration?: string }) {
  return (
    <span
      aria-hidden
      className={cn("sheen absolute inset-y-0 w-2/5", className)}
      style={duration ? { animationDuration: duration } : undefined}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </span>
  );
}

/** Grounded contact shadow ellipse. */
function GroundShadow({ className, color }: { className?: string; color: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute bottom-[3px] h-[6px] rounded-full blur-[3px]", className)}
      style={{ background: color }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  BLOOD — glossy 3D raindrop falling into a puddle                   */
/* ------------------------------------------------------------------ */

/** A single teardrop object: rounded volume + specular + shaded underside. */
function BloodDrop({ size, hue }: { size: number; hue: { top: string; mid: string; deep: string } }) {
  const s = `${size}px`;
  return (
    // The 45°-rotated square with one sharp corner forms the teardrop tail.
    <span
      className="relative block"
      style={{
        width: s,
        height: s,
        borderRadius: "0 50% 50% 50%",
        transform: "rotate(45deg) scaleY(1.12)",
        background: `linear-gradient(135deg, ${hue.top} 0%, ${hue.mid} 46%, ${hue.deep} 100%)`,
        boxShadow:
          "inset -3px -4px 5px rgba(110,0,12,0.55), inset 2px 3px 4px rgba(255,255,255,0.35), 0 4px 7px rgba(150,10,20,0.4)",
      }}
    >
      {/* Specular highlight (top-left of the bulb, counter-rotated) */}
      <span
        className="absolute rounded-full"
        style={{
          width: size * 0.32,
          height: size * 0.24,
          left: size * 0.16,
          top: size * 0.5,
          transform: "rotate(-45deg)",
          background:
            "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.25) 55%, transparent 75%)",
        }}
      />
      {/* Tiny secondary sparkle */}
      <span
        className="absolute rounded-full bg-white/90"
        style={{ width: Math.max(2, size * 0.08), height: Math.max(2, size * 0.08), left: size * 0.55, top: size * 0.62, transform: "rotate(-45deg)" }}
      />
    </span>
  );
}

export function BloodVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        {/* Static reserve drop sitting in the puddle (composition anchor) */}
        <span className="absolute bottom-[9px] left-[10px] opacity-90">
          <BloodDrop size={15} hue={{ top: "#ff8a91", mid: "#e11d33", deep: "#8f0415" }} />
        </span>
        {/* Falling main drop */}
        <span className="drop-fall absolute left-[38px] top-[6px]">
          <BloodDrop size={22} hue={{ top: "#ff7a83", mid: "#dc162c", deep: "#7e0212" }} />
        </span>
        {/* Secondary smaller droplet */}
        <span className="drop-fall-late absolute left-[24px] top-[10px]">
          <BloodDrop size={12} hue={{ top: "#ff97a0", mid: "#e52840", deep: "#97051a" }} />
        </span>
        {/* Impact ripple rings */}
        <span
          aria-hidden
          className="drop-ripple absolute bottom-[6px] left-[30px] h-[8px] w-[22px] rounded-full border-[1.5px] border-destructive/70"
        />
        <span
          aria-hidden
          className="drop-ripple absolute bottom-[6px] left-[30px] h-[8px] w-[22px] rounded-full border border-destructive/40"
          style={{ animationDelay: "0.18s" }}
        />
        {/* Puddle */}
        <span
          aria-hidden
          className="absolute inset-x-[14px] bottom-[4px] h-[7px] rounded-[50%]"
          style={{ background: "linear-gradient(180deg, #d31b31 0%, #7e0413 100%)", boxShadow: "inset 0 2px 2px rgba(255,255,255,0.35), inset 0 -2px 3px rgba(90,0,8,0.5)" }}
        />
        <GroundShadow className="inset-x-4" color="rgba(150,15,25,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  INSURANCE - large 3D protective shield                             */
/* ------------------------------------------------------------------ */

export function InsuranceVisual() {
  const shape: React.CSSProperties = {
    borderRadius: "15% 15% 48% 48% / 13% 13% 90% 90%",
  };
  return (
    <>
      <span aria-hidden className="obj-float absolute inset-0">
        {/* Back rim (depth) */}
        <span
          className="absolute left-[4px] right-[10px] top-[8px] bottom-[6px]"
          style={{
            ...shape,
            background: "linear-gradient(150deg, #b78a17 0%, #6e4e06 100%)",
            boxShadow: "inset 0 -3px 5px rgba(50,32,0,0.65)",
          }}
        />
        {/* Rotating shield body — sway reveals the beveled edge */}
        <span className="shield-sway absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {/* SIDE EDGE plate (visible when rotated — physical thickness) */}
          <span
            className="absolute left-[11px] right-[7px] top-[13px] bottom-[6px]"
            style={{
              ...shape,
              transform: "translateZ(-8px)",
              background: "linear-gradient(160deg, #a97e12 0%, #5c3f04 100%)",
              boxShadow: "inset 0 -2px 4px rgba(40,25,0,0.6)",
            }}
          />
          {/* FRONT surface — glassy gold */}
          <span
            className="scene-z2 absolute left-[5px] right-[9px] top-[7px] bottom-[9px] overflow-hidden"
            style={{
              ...shape,
              background:
                "linear-gradient(150deg, #fff3c4 0%, #f5cf55 26%, #d9a723 55%, #a87a10 82%, #8a6209 100%)",
              boxShadow:
                "inset 0 3px 5px rgba(255,255,255,0.95), inset 0 -6px 8px rgba(96,64,2,0.6), inset 4px 0 6px rgba(255,255,255,0.35), inset -4px 0 6px rgba(90,60,2,0.4), 0 7px 12px rgba(150,105,10,0.45)",
            }}
          >
            {/* Beveled inner frame */}
            <span
              className="absolute inset-[4px]"
              style={{
                ...shape,
                background: "linear-gradient(160deg, rgba(255,255,255,0.5), rgba(255,255,255,0.06) 38%, rgba(255,255,255,0.18) 60%, rgba(110,74,4,0.5))",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -1px 2px rgba(80,52,0,0.6)",
              }}
            />
            {/* Central boss — raised emblem plate with a medical cross */}
            <span
              className="absolute left-1/2 top-[45%] h-[30px] w-[30px] rounded-[8px]"
              style={{
                transform: "translateX(-50%) translateY(-50%) translateZ(5px)",
                background: "linear-gradient(150deg, #ffe9a0 0%, #eec23f 55%, #b98a10 100%)",
                boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 4px rgba(100,66,2,0.55), 0 3px 5px rgba(90,60,0,0.45)",
              }}
            >
              <span className="absolute left-1/2 top-1/2 h-[14px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ boxShadow: "0 1px 2px rgba(90,60,0,0.5)" }} />
              <span className="absolute left-1/2 top-1/2 h-[4px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ boxShadow: "0 1px 2px rgba(90,60,0,0.5)" }} />
            </span>
            {/* THE SHINE — wide glass reflection sweeping the face */}
            <Sheen className="left-0 w-3/5" duration="4.2s" />
            <Sheen className="left-0 w-1/4 opacity-50" duration="4.2s" />
            {/* Rim light */}
            <span className="absolute inset-x-[12%] top-[2.5px] h-[2px] rounded-full bg-white/95" />
          </span>
        </span>
        <GroundShadow className="inset-x-3" color="rgba(150,105,10,0.4)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  HOSPITALS - miniature 3D hospital building                         */
/* ------------------------------------------------------------------ */

export function HospitalVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          <span className="cam-drift absolute inset-0">
            {/* SIDE wing (right, shaded) — the building depth */}
            <span
              className="scene-z2 absolute bottom-[10px] right-[4px] top-[16px] w-[17px]"
              style={{
                transform: "skewY(-16deg)",
                background: "linear-gradient(180deg, #7db3aa 0%, #3f7a71 100%)",
                boxShadow: "inset -3px 0 4px rgba(12,66,60,0.45), inset 0 2px 2px rgba(255,255,255,0.35)",
              }}
            >
              <span className="absolute inset-x-[2.5px] top-[5px] space-y-[5px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="window-flicker block h-[4.5px] rounded-[1px]"
                    style={{
                      animationDelay: `${1.2 + i * 0.6}s`,
                      background: "linear-gradient(180deg, #ffe1a0, #f0a92e)",
                    }}
                  />
                ))}
              </span>
            </span>
            {/* FRONT face — two floors */}
            <span
              className="scene-z2 absolute bottom-[8px] left-[5px] right-[16px] top-[5px] overflow-hidden"
              style={{
                background: "linear-gradient(165deg, #f2faf8 0%, #dff0ec 55%, #bfe0d9 100%)",
                boxShadow: "0 7px 12px rgba(20,90,80,0.32), inset 0 0 0 1.5px rgba(70,150,138,0.35), inset 0 2px 2px rgba(255,255,255,0.95)",
              }}
            >
              {/* Floor divider */}
              <span className="absolute inset-x-0 top-1/2 h-[2px] bg-[#b9dbd4]" />
              {/* Ground-floor: entrance + windows */}
              <span className="absolute inset-x-[4px] bottom-[3px] flex items-end justify-between">
                <span className="window-flicker h-[7px] w-[8px] rounded-[1px]" style={{ background: "linear-gradient(180deg, #ffe1a0, #f0a92e)", animationDelay: "0.9s" }} />
                <span className="h-[12px] w-[12px] rounded-t-[3px] bg-gradient-to-b from-[#2b8a80] to-[#175d56]" />
                <span className="window-flicker h-[7px] w-[8px] rounded-[1px]" style={{ background: "linear-gradient(180deg, #ffe1a0, #f0a92e)", animationDelay: "2.1s" }} />
              </span>
              {/* Awning */}
              <span className="absolute bottom-[15px] left-1/2 h-[3px] w-[17px] -translate-x-1/2 rounded-[2px] bg-[#2b8a80]" />
              {/* Upper-floor windows */}
              <span className="absolute inset-x-[4px] top-[5px] grid grid-cols-3 gap-[3.5px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="window-flicker h-[7px] rounded-[1px]"
                    style={{
                      animationDelay: `${i * 0.55}s`,
                      background: "linear-gradient(180deg, #ffe7ad 0%, #f2a93b 100%)",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.85)",
                    }}
                  />
                ))}
              </span>
              {/* Facade light sweep */}
              <Sheen className="left-0 opacity-70" duration="6s" />
            </span>
            {/* ROOF slab */}
            <span
              className="scene-z3 absolute left-[3px] right-[11px] top-[2px] h-[6px]"
              style={{
                transform: "skewX(-40deg)",
                transformOrigin: "bottom left",
                background: "linear-gradient(180deg, #eef8f6, #aed4cd)",
                boxShadow: "0 2px 3px rgba(20,80,72,0.35)",
              }}
            />
            {/* Rooftop medical cross on a sign post */}
            <span className="sign-sway scene-z3 absolute left-[20px] top-0 h-[16px] w-[16px]">
              <span className="absolute left-1/2 top-full h-[4px] w-[2px] -translate-x-1/2 bg-[#175d56]" />
              <span
                className="absolute inset-0 rounded-[3.5px]"
                style={{
                  background: "linear-gradient(150deg, #ff6b6b 0%, #e11d2e 45%, #a80f1e 100%)",
                  boxShadow: "inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -2px 3px rgba(110,5,15,0.5), 0 2px 4px rgba(140,20,20,0.45)",
                }}
              />
              <span className="absolute left-1/2 top-1/2 h-[10px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              <span className="absolute left-1/2 top-1/2 h-[3px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </span>
            {/* Ground / base plate */}
            <span
              className="absolute bottom-[3px] left-[2px] right-[7px] h-[7px]"
              style={{
                transform: "skewX(-42deg)",
                transformOrigin: "top left",
                background: "linear-gradient(180deg, #cfe8e3, #9fc6bf)",
                boxShadow: "0 3px 5px rgba(20,90,80,0.3)",
              }}
            />
          </span>
        </span>
        <GroundShadow className="inset-x-2" color="rgba(20,90,80,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  OPD — floating 3D token with marching queue                        */
/* ------------------------------------------------------------------ */

export function OpdVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        {/* Token with thickness: dark edge plate behind + beveled face */}
        <span className="token-bob absolute left-1/2 top-[8px] -translate-x-1/2">
          {/* Thickness/edge */}
          <span
            className="absolute left-[2px] top-[3px] h-[34px] w-[40px] rounded-[9px]"
            style={{ background: "linear-gradient(180deg, #14507f, #0c3557)" }}
          />
          {/* Face */}
          <span
            className="relative flex h-[34px] w-[40px] items-center justify-center rounded-[9px]"
            style={{
              background: "linear-gradient(155deg, #4da3e8 0%, #2477c4 55%, #1a5c9e 100%)",
              boxShadow:
                "inset 0 2px 3px rgba(255,255,255,0.65), inset 0 -4px 5px rgba(10,50,90,0.5), 0 5px 9px rgba(20,80,140,0.45)",
            }}
          >
            <span className="text-[15px] font-extrabold tracking-tight text-white" style={{ textShadow: "0 2px 2px rgba(8,40,70,0.6)" }}>
              #24
            </span>
            {/* Glass sheen corner */}
            <span className="absolute left-[4px] top-[3px] h-[10px] w-[14px] -rotate-[18deg] rounded-full bg-white/55 blur-[1px]" />
            <Sheen className="left-0 opacity-60" duration="5.4s" />
          </span>
          {/* Slot at the token bottom */}
          <span className="absolute inset-x-[8px] -bottom-[3px] h-[3px] rounded-full bg-[#0c3557]" />
        </span>
        {/* Queue tickets marching forward beneath */}
        <span className="absolute inset-x-[8px] bottom-[10px] flex items-center justify-center gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="queue-march h-[12px] w-[15px] rounded-[3px]"
              style={{
                animationDelay: `${i * 0.45}s`,
                background: "linear-gradient(180deg, #ffffff, #dcebf7)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 3px rgba(30,90,150,0.3)",
              }}
            >
              <span className="mx-auto mt-[4px] block h-[2px] w-[8px] rounded-full bg-info/60" />
            </span>
          ))}
        </span>
        <GroundShadow className="inset-x-5" color="rgba(30,90,150,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  APPOINTMENTS - 3D calendar + appointment card + clock              */
/* ------------------------------------------------------------------ */

export function AppointmentsVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float-slow absolute inset-0">
          {/* Back plate (thickness) */}
          <span
            className="absolute left-[5px] right-[3px] top-[12px] bottom-[7px] rounded-[10px]"
            style={{ background: "linear-gradient(180deg, #4c3a86, #322557)", transform: "translateX(2px)" }}
          />
          {/* Calendar face */}
          <span
            className="scene-z2 absolute left-[3px] right-[5px] top-[9px] bottom-[10px] overflow-hidden rounded-[10px]"
            style={{
              background: "linear-gradient(160deg, #ffffff 0%, #f4effe 55%, #e2d9f9 100%)",
              boxShadow: "0 6px 10px rgba(90,60,160,0.35), inset 0 2px 2px rgba(255,255,255,0.95)",
            }}
          >
            {/* Header */}
            <span className="absolute inset-x-0 top-0 h-[10px] bg-gradient-to-r from-[#8b6ce6] to-[#6d4fd0]" />
            <span className="absolute left-[5px] top-[2.5px] h-[4px] w-[4px] rounded-full bg-white/85" />
            <span className="absolute right-[5px] top-[2.5px] h-[4px] w-[4px] rounded-full bg-white/85" />
            {/* Date grid with one glowing "today" */}
            <span className="absolute inset-x-[4px] top-[14px] grid grid-cols-4 gap-[3.5px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("h-[7px] rounded-[2px]", i === 6 ? "" : "bg-violet/25")}
                  style={
                    i === 6
                      ? {
                          background: "linear-gradient(150deg, #a78bfa, #6d4fd0)",
                          boxShadow: "0 0 0 1.5px rgba(255,255,255,0.9), 0 0 8px rgba(139,108,230,0.65)",
                          animation: "window-light 2.6s ease-in-out infinite",
                        }
                      : undefined
                  }
                />
              ))}
            </span>
          </span>
          {/* Binder rings */}
          <span className="absolute left-[12px] top-[5px] h-[9px] w-[3.5px] rounded-full bg-[#4c3a86]" />
          <span className="absolute right-[14px] top-[5px] h-[9px] w-[3.5px] rounded-full bg-[#4c3a86]" />
          {/* Appointment card sliding forward in front (z-height) */}
          <span
            className="card-slide scene-z3 absolute bottom-[4px] left-1/2 h-[26px] w-[46px] -translate-x-1/2 overflow-hidden rounded-[6px]"
            style={{
              background: "linear-gradient(160deg, #ffffff, #efe9fd 70%, #ddd2f8 100%)",
              boxShadow: "0 5px 9px rgba(70,45,140,0.4), inset 0 1.5px 2px rgba(255,255,255,0.95)",
            }}
          >
            <span className="absolute left-[6px] top-[4px] h-[4px] w-[22px] rounded-full bg-[#8b6ce6]/80" />
            <span className="absolute left-[6px] top-[11px] h-[3px] w-[30px] rounded-full bg-violet/30" />
            <span className="absolute bottom-[4px] left-[6px] h-[3px] w-[18px] rounded-full bg-violet/20" />
            {/* Green confirmation check */}
            <span className="check-pop absolute bottom-[3px] right-[4px] h-[9px] w-[9px] rounded-full bg-gradient-to-br from-[#4ade80] to-[#16a34a]" style={{ boxShadow: "0 1.5px 3px rgba(20,120,60,0.5)" }}>
              <span className="absolute left-1/2 top-1/2 h-[4px] w-[2.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-[1.8px] border-r-[1.8px] border-white" />
            </span>
          </span>
          {/* Small clock, top-right */}
          <span
            className="absolute right-[3px] top-[7px] h-[18px] w-[18px] rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #ffffff, #d8ccf6 70%, #b7a4ec 100%)",
              boxShadow: "0 3px 5px rgba(70,45,140,0.4), inset 0 1.5px 2px rgba(255,255,255,0.95)",
            }}
          >
            <span className="clock-tick-smooth absolute left-1/2 top-[4px] h-[5px] w-[1.5px] -translate-x-1/2 rounded-full bg-[#4c3a86]" style={{ transformOrigin: "bottom center" }} />
            <span className="absolute left-1/2 top-1/2 h-[4px] w-[1.5px] -translate-x-1/2 -translate-y-full rotate-90 rounded-full bg-[#6d4fd0]" style={{ transformOrigin: "bottom center" }} />
            <span className="absolute left-1/2 top-1/2 h-[2.5px] w-[2.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4c3a86]" />
          </span>
        </span>
        <GroundShadow className="inset-x-4" color="rgba(90,60,160,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MEDICINES - large glossy capsule + bottle + tablets                */
/* ------------------------------------------------------------------ */

export function MedicineVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          {/* Medicine bottle — cylindrical body, ribbed cap, label (back-left) */}
          <span className="absolute left-[5px] top-[12px]">
            <span
              className="absolute left-[1px] top-[-5px] h-[8px] w-[20px] rounded-[3px]"
              style={{
                background: "repeating-linear-gradient(90deg, #2f8f85 0px, #2f8f85 2.5px, #23726a 2.5px, #23726a 5px)",
                boxShadow: "inset 0 1.5px 1.5px rgba(255,255,255,0.55), inset 0 -1.5px 2px rgba(10,60,55,0.5)",
              }}
            />
            <span
              className="relative block h-[38px] w-[22px] overflow-hidden rounded-[4px_4px_6px_6px]"
              style={{
                background: "linear-gradient(90deg, #e8f7f4 0%, #ffffff 22%, #cfe9e4 55%, #9fc9c1 88%, #86b3ab 100%)",
                boxShadow: "0 4px 7px rgba(20,90,80,0.35), inset 0 2px 2px rgba(255,255,255,0.9)",
              }}
            >
              {/* Label with text lines + cross */}
              <span className="absolute inset-x-[1.5px] top-[8px] bottom-[6px] rounded-[2px] bg-white" style={{ boxShadow: "inset 0 0 0 1px rgba(20,90,80,0.15)" }}>
                <span className="absolute left-1/2 top-[3px] h-[6px] w-[2px] -translate-x-1/2 bg-[#2b8a80]" />
                <span className="absolute left-1/2 top-[5px] h-[2px] w-[6px] -translate-x-1/2 bg-[#2b8a80]" />
                <span className="absolute inset-x-[3px] bottom-[3px] space-y-[2px]">
                  <span className="block h-[1.5px] rounded-full bg-[#9fc9c1]" />
                  <span className="block h-[1.5px] w-2/3 rounded-full bg-[#9fc9c1]" />
                </span>
              </span>
              {/* Vertical glass highlight */}
              <span className="absolute left-[3px] top-[2px] h-[30px] w-[3px] rounded-full bg-white/80 blur-[0.5px]" />
            </span>
          </span>
          {/* Blister hint behind at negative Z */}
          <span className="scene-z1 absolute right-[4px] top-[6px] h-[26px] w-[30px] rotate-[18deg] rounded-[4px] opacity-70" style={{ background: "linear-gradient(160deg, #dbeef8, #a9cfe4)", boxShadow: "0 3px 5px rgba(40,100,140,0.3)" }} />
          {/* THE CAPSULE — large, glossy, two-tone, spinning */}
          <span className="obj-spin absolute bottom-[13px] left-1/2 h-[26px] w-[54px] -translate-x-1/2" style={{ transformStyle: "preserve-3d" }}>
            <span className="relative block h-full w-full overflow-hidden rounded-full" style={{ boxShadow: "0 5px 9px rgba(15,90,80,0.42), inset 0 -3px 5px rgba(10,50,45,0.35)" }}>
              {/* Teal half */}
              <span className="absolute inset-y-0 left-0 w-1/2" style={{ background: "linear-gradient(180deg, #4fd1c5 0%, #14b8a6 45%, #0b7c72 100%)" }} />
              {/* White half */}
              <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f1f5f4 55%, #c9d6d3 100%)" }} />
              {/* Center seam ring */}
              <span className="absolute inset-y-[1px] left-1/2 w-[2.5px] -translate-x-1/2 rounded-full bg-[#0b5f57]/45" />
              {/* Barrel speculars */}
              <span className="absolute left-[6px] top-[3px] h-[5px] w-[26px] rounded-full bg-white/75 blur-[0.5px]" />
              <span className="absolute right-[8px] bottom-[3px] h-[3px] w-[18px] rounded-full bg-white/45 blur-[0.5px]" />
              {/* Moving reflection across the white half */}
              <Sheen className="right-0 left-auto w-1/2 opacity-80" duration="3.8s" />
            </span>
          </span>
          {/* Small red tablet shifting in depth */}
          <span
            className="tablet-shift scene-z3 absolute bottom-[5px] right-[8px] h-[13px] w-[13px] rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #ff9d94 0%, #ef5350 45%, #b71c1c 100%)",
              boxShadow: "0 3px 5px rgba(160,30,30,0.45), inset 0 -2px 3px rgba(120,10,10,0.5)",
            }}
          >
            <span className="absolute left-1/2 top-[2px] h-[1.5px] w-[7px] -translate-x-1/2 rounded-full bg-white/55" />
          </span>
          {/* Tiny sparkle */}
          <span aria-hidden className="twinkle absolute right-[24px] top-[2px] h-[4px] w-[4px] rotate-45 bg-white/90" style={{ clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)" }} />
        </span>
        <GroundShadow className="inset-x-3" color="rgba(20,110,100,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  HEALTH RECORDS - full 3D document stack                            */
/* ------------------------------------------------------------------ */

export function RecordsVisual() {
  const page = "linear-gradient(160deg, #ffffff 0%, #f6fafc 60%, #e3edf4 100%)";
  const edge = "linear-gradient(180deg, #c9d8e4, #8fa9bc)";
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float-slow absolute inset-0">
          {/* Back pages — each with a side-edge slab for thickness */}
          <span className="doc-drift absolute bottom-[9px] left-[14px] top-[7px] w-[42px] -rotate-[9deg]" style={{ transformStyle: "preserve-3d" }}>
            <span className="absolute left-[2.5px] top-[2.5px] h-full w-full rounded-[5px]" style={{ background: edge, transform: "translate(2.5px, 2.5px)" }} />
            <span className="relative h-full w-full rounded-[5px]" style={{ background: page, boxShadow: "0 4px 8px rgba(30,70,110,0.3)" }} />
          </span>
          <span className="doc-drift absolute bottom-[11px] left-[18px] top-[5px] w-[42px] -rotate-[4deg]" style={{ transformStyle: "preserve-3d", animationDelay: "0.5s" }}>
            <span className="absolute left-[2.5px] top-[2.5px] h-full w-full rounded-[5px]" style={{ background: edge, transform: "translate(2.5px, 2.5px)" }} />
            <span className="relative h-full w-full rounded-[5px]" style={{ background: page, boxShadow: "0 4px 8px rgba(30,70,110,0.3)" }} />
          </span>
          {/* FRONT document — the medical record artifact */}
          <span className="page-flip scene-z3 absolute bottom-[6px] left-[22px] top-[3px] w-[44px]" style={{ transformStyle: "preserve-3d" }}>
            <span className="absolute left-[2.5px] top-[2.5px] h-full w-full rounded-[5px]" style={{ background: edge, transform: "translate(2.5px, 2.5px)" }} />
            <span
              className="relative h-full w-full overflow-hidden rounded-[5px]"
              style={{ background: page, boxShadow: "0 6px 11px rgba(30,70,110,0.38), inset 0 1.5px 2px rgba(255,255,255,0.95)" }}
            >
              {/* Red medical cross header */}
              <span className="absolute left-[5px] top-[5px] h-[9px] w-[9px] rounded-[2.5px]" style={{ background: "linear-gradient(150deg, #ff6b6b, #d31b31 60%, #a80f1e)" }}>
                <span className="absolute left-1/2 top-1/2 h-[6px] w-[1.8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                <span className="absolute left-1/2 top-1/2 h-[1.8px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              </span>
              <span className="absolute left-[17px] top-[6px] h-[3px] w-[18px] rounded-full bg-info/50" />
              <span className="absolute left-[17px] top-[11px] h-[2px] w-[12px] rounded-full bg-info/30" />
              {/* Text-like lines ghosting in */}
              <span className="doc-lines absolute inset-x-[5px] bottom-[16px] space-y-[3px]">
                <span className="block h-[2.5px] rounded-full bg-slate-400/70" />
                <span className="block h-[2.5px] w-4/5 rounded-full bg-slate-400/55" />
                <span className="block h-[2.5px] w-3/5 rounded-full bg-slate-400/40" />
              </span>
              {/* Small chart */}
              <svg aria-hidden viewBox="0 0 34 12" className="absolute inset-x-[5px] bottom-[4px] h-[10px] w-[34px]">
                <polyline points="1,10 7,6 13,8 19,3 25,5 33,1" fill="none" stroke="#2b8a80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Light sweep across the top page */}
              <Sheen className="left-0 opacity-60" duration="5.6s" />
            </span>
          </span>
        </span>
        <GroundShadow className="inset-x-5" color="rgba(30,70,110,0.32)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGNOSTICS - large glass Erlenmeyer flask                         */
/* ------------------------------------------------------------------ */

export function DiagnosticsVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          {/* Glass body: neck + conical belly in one clipped layer */}
          <span
            className="absolute inset-x-[3px] bottom-[4px] top-[4px]"
            style={{
              clipPath: "polygon(39% 0, 61% 0, 61% 24%, 100% 87%, 91% 100%, 9% 100%, 0 87%, 39% 24%)",
              background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(214,236,250,0.55) 38%, rgba(160,205,240,0.7) 100%)",
              boxShadow: "inset 0 0 0 2px rgba(110,165,215,0.6), inset 0 2px 4px rgba(255,255,255,0.95)",
            }}
          >
            {/* Liquid body with its own tilt */}
            <span className="liquid-tilt absolute inset-x-0 bottom-0 top-[38%]">
              <span
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(11% 0, 89% 0, 100% 100%, 0 100%)",
                  background: "linear-gradient(180deg, #67c3f0 0%, #3b82d9 55%, #2b5fc0 100%)",
                  boxShadow: "inset 0 3px 4px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(20,50,120,0.5)",
                }}
              />
              {/* Meniscus highlight */}
              <span className="absolute inset-x-[9%] top-0 h-[3px] rounded-full bg-white/75" />
              {/* Micro particles drifting inside the liquid */}
              <span className="particle-drift absolute bottom-[6px] left-[30%] h-[2px] w-[2px] rounded-full bg-white/85" />
              <span className="particle-drift absolute bottom-[10px] left-[55%] h-[2.5px] w-[2.5px] rounded-full bg-white/70" style={{ animationDelay: "1.1s" }} />
            </span>
            {/* Bubbles rising */}
            <span className="bubble absolute bottom-[5px] left-[44%] h-[5px] w-[5px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #ffffff, rgba(255,255,255,0.35))" }} />
            <span className="bubble absolute bottom-[3px] left-[56%] h-[4px] w-[4px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #ffffff, rgba(255,255,255,0.35))", animationDelay: "0.9s" }} />
            <span className="bubble absolute bottom-[4px] left-[36%] h-[3px] w-[3px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #ffffff, rgba(255,255,255,0.35))", animationDelay: "1.7s" }} />
            {/* Etched measurement ticks */}
            <span className="absolute bottom-[14px] left-[10%] space-y-[5px]">
              {[10, 7, 4].map((w, i) => (
                <span key={i} className="block h-[1.5px] rounded-full bg-white/70" style={{ width: `${w}px` }} />
              ))}
            </span>
          </span>
          {/* Rim lip with thickness */}
          <span className="absolute left-[26px] top-[2px] h-[5px] w-[22px] rounded-[3px]" style={{ background: "linear-gradient(180deg, #f2fafd, #9cc4e0)", boxShadow: "0 1.5px 3px rgba(70,120,170,0.4), inset 0 1px 1px rgba(255,255,255,0.95)" }} />
          {/* Glass sheen sweep */}
          <Sheen className="left-[10%] w-1/3 opacity-60" duration="5s" />
        </span>
        <GroundShadow className="inset-x-6" color="rgba(40,100,160,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  EMERGENCY — physical 3D rotating beacon                            */
/* ------------------------------------------------------------------ */

export function EmergencyVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          {/* Glass dome with rotating light core */}
          <span
            className="scene-z2 absolute inset-x-[10px] right-[10px] left-[10px] top-[8px] h-[34px] overflow-hidden"
            style={{
              borderRadius: "50% 50% 12% 12% / 74% 74% 12% 12%",
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.9) 0%, rgba(255,200,200,0.45) 38%, rgba(215,45,45,0.55) 100%)",
              boxShadow:
                "inset 0 3px 4px rgba(255,255,255,0.95), inset 0 -4px 6px rgba(140,10,10,0.45), 0 5px 9px rgba(170,25,25,0.4)",
            }}
          >
            {/* Rotating lamp core (bright band sweeps inside the dome) */}
            <span
              className="beacon-sweep absolute bottom-[4px] left-[16%] right-[16%] top-[26%]"
              style={{
                borderRadius: "50%",
                background: "radial-gradient(circle at 50% 45%, #ffd2d2 0%, #ff5a52 45%, #d41414 100%)",
                boxShadow: "0 0 10px rgba(255,70,60,0.8), inset 0 -2px 3px rgba(120,0,0,0.5)",
              }}
            />
            {/* Dome specular */}
            <span className="absolute left-[18%] top-[9%] h-[8px] w-[14px] -rotate-[22deg] rounded-full bg-white/90 blur-[0.5px]" />
            <span className="absolute right-[16%] top-[22%] h-[4px] w-[6px] rotate-[18deg] rounded-full bg-white/60 blur-[0.5px]" />
          </span>
          {/* Metal base: two stacked slabs for depth */}
          <span
            className="absolute inset-x-[7px] top-[40px] h-[9px] rounded-[5px]"
            style={{ background: "linear-gradient(180deg, #6b7280 0%, #374151 100%)", boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.4)" }}
          />
          <span
            className="scene-z3 absolute inset-x-[5px] top-[47px] h-[8px] rounded-[5px]"
            style={{ background: "linear-gradient(180deg, #4b5563 0%, #1f2937 100%)", boxShadow: "0 4px 7px rgba(0,0,0,0.4), inset 0 1.5px 1.5px rgba(255,255,255,0.25)" }}
          />
          {/* Red reflection cast on the base */}
          <span className="beacon-glow absolute inset-x-[12px] top-[41px] h-[4px] rounded-full bg-destructive/60" />
        </span>
        {/* Controlled floor glow reflection */}
        <span className="beacon-glow absolute inset-x-[10px] bottom-[2px] h-[7px] rounded-[50%] bg-destructive/35 blur-[3px]" />
        <GroundShadow className="inset-x-4" color="rgba(170,25,25,0.35)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FAMILY - 3D figures with arms and legs, layered depths             */
/* ------------------------------------------------------------------ */

type PersonHue = { hi: string; mid: string; deep: string };

/** A small 3D person: head + torso with facets + two legs + arms. */
function Person({ scale, hue, className }: { scale: number; hue: PersonHue; className?: string }) {
  return (
    <span className={cn("relative block", className)} style={{ width: 22 * scale, height: 34 * scale }}>
        {/* Head */}
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
          style={{
            width: 10 * scale,
            height: 10 * scale,
            background: `radial-gradient(circle at 34% 28%, ${hue.hi} 0%, ${hue.mid} 55%, ${hue.deep} 100%)`,
            boxShadow: `inset -${1.5 * scale}px -${1.5 * scale}px ${2.5 * scale}px rgba(30,10,60,0.45), 0 ${1.5 * scale}px ${3 * scale}px rgba(60,30,120,0.4)`,
          }}
        />
        {/* Torso with front-facet lighting */}
        <span
          className="absolute left-1/2 top-[11px] h-[14px] w-[15px] -translate-x-1/2"
          style={{
            transform: `translateX(-50%)`,
            borderRadius: `${6 * scale}px ${6 * scale}px ${3 * scale}px ${3 * scale}px`,
            background: `linear-gradient(105deg, ${hue.hi} 0%, ${hue.mid} 42%, ${hue.deep} 100%)`,
            boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(40,20,80,0.4)",
          }}
        />
        {/* Arms */}
        <span className="absolute left-[-1px] top-[13px] h-[11px] w-[3px] -rotate-[24deg] rounded-full" style={{ background: hue.mid, boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)" }} />
        <span className="absolute right-[-1px] top-[13px] h-[11px] w-[3px] rotate-[24deg] rounded-full" style={{ background: hue.deep, boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)" }} />
        {/* Legs */}
        <span className="absolute bottom-0 left-[5px] h-[9px] w-[3.5px] rounded-b-full" style={{ background: hue.deep }} />
        <span className="absolute bottom-0 right-[5px] h-[9px] w-[3.5px] rounded-b-full" style={{ background: hue.mid, boxShadow: "inset 0 -1px 1px rgba(30,10,60,0.5)" }} />
      </span>
  );
}

export function FamilyVisual() {
  const adult: PersonHue = { hi: "#c4b5fd", mid: "#8b5cf6", deep: "#5b21b6" };
  const child: PersonHue = { hi: "#fcd34d", mid: "#f59e0b", deep: "#b45309" };

  return (
    <>
      <span aria-hidden className="absolute inset-0">
        {/* Connection web */}
        <svg aria-hidden viewBox="0 0 80 80" className="absolute inset-0 h-full w-full">
          <g stroke="#8b5cf6" strokeWidth="1.4" strokeLinecap="round" opacity="0.75">
            <line className="link-flow" x1="40" y1="26" x2="18" y2="48" style={{ animationDelay: "0s" }} />
            <line className="link-flow" x1="40" y1="26" x2="62" y2="48" style={{ animationDelay: "0.35s" }} />
            <line className="link-flow" x1="18" y1="48" x2="62" y2="48" style={{ animationDelay: "0.7s" }} />
            <line className="link-flow" x1="40" y1="26" x2="46" y2="60" style={{ animationDelay: "1.05s" }} />
          </g>
          <circle className="twinkle" cx="40" cy="26" r="3" fill="#a78bfa" />
        </svg>
        {/* People at different depths */}
        <span className="orbit-y scene-z3 absolute left-[29px] top-[6px]">
          <Person scale={1.15} hue={adult} className="obj-float" />
        </span>
        <span className="orbit-y scene-z2 absolute bottom-[14px] left-[8px]">
          <Person scale={0.95} hue={adult} className="obj-float" />
        </span>
        <span className="orbit-y scene-z2 absolute bottom-[16px] right-[7px]">
          <Person scale={0.95} hue={adult} className="obj-float" />
        </span>
        <span className="orbit-y scene-z3 absolute bottom-[2px] right-[18px]">
          <Person scale={0.7} hue={child} className="obj-float" />
        </span>
        <GroundShadow className="inset-x-4" color="rgba(110,60,200,0.3)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  CONSULTATION - large 3D video-call screen with doctor              */
/* ------------------------------------------------------------------ */

export function ConsultationVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          {/* Signal rings pulsing from behind the screen */}
          <span aria-hidden className="signal-ring absolute bottom-[8px] left-[6px] h-[14px] w-[14px] rounded-full border-2 border-indigo-400/60" />
          <span aria-hidden className="signal-ring absolute bottom-[8px] left-[6px] h-[14px] w-[14px] rounded-full border border-indigo-400/40" style={{ animationDelay: "1.4s" }} />
          {/* Monitor with back-plate thickness */}
          <span
            className="absolute left-[4px] right-[8px] top-[7px] bottom-[13px] rounded-[8px]"
            style={{ background: "linear-gradient(180deg, #3b3480, #262054)", transform: "translate(2.5px, 2.5px)" }}
          />
          <span
            className="scene-z2 absolute left-[2px] right-[6px] top-[5px] bottom-[11px] overflow-hidden rounded-[8px]"
            style={{
              background: "linear-gradient(160deg, #eef0ff 0%, #dfe3fb 45%, #c3cdf5 100%)",
              boxShadow: "0 6px 11px rgba(60,50,140,0.4), inset 0 2px 2px rgba(255,255,255,0.95)",
            }}
          >
            {/* Screen glass */}
            <span className="absolute inset-[3px] overflow-hidden rounded-[5px]" style={{ background: "linear-gradient(165deg, #4f46a8 0%, #3b3390 55%, #2c2670 100%)", boxShadow: "inset 0 1.5px 3px rgba(255,255,255,0.35), inset 0 -3px 5px rgba(10,8,40,0.55)" }}>
              {/* Doctor bust — shaded, gently swaying */}
              <span className="avatar-sway absolute bottom-[3px] left-1/2 -translate-x-1/2">
                <span
                  className="relative block h-[13px] w-[13px] rounded-full"
                  style={{ background: "radial-gradient(circle at 34% 28%, #ffe0c2 0%, #e8b48c 55%, #b57e50 100%)", boxShadow: "inset -1.5px -1.5px 2.5px rgba(120,70,30,0.4)" }}
                />
                <span
                  className="relative mx-auto -mt-[2px] block h-[13px] w-[24px]"
                  style={{
                    borderRadius: "8px 8px 2px 2px",
                    background: "linear-gradient(105deg, #e6e2fb 0%, #cdc7f4 45%, #9a91dd 100%)",
                    boxShadow: "inset 0 1.5px 2px rgba(255,255,255,0.6)",
                  }}
                >
                  {/* Stethoscope hint */}
                  <span className="absolute left-[7px] top-[2px] h-[7px] w-[7px] rounded-full border-[1.5px] border-indigo-300/80" />
                </span>
              </span>
              {/* REC camera dot */}
              <span className="absolute left-[4px] top-[4px] flex items-center gap-[2.5px]">
                <span className="rec-pulse h-[4px] w-[4px] rounded-full bg-[#ff5a5a]" style={{ boxShadow: "0 0 4px rgba(255,90,90,0.8)" }} />
                <span className="h-[2px] w-[9px] rounded-full bg-white/45" />
              </span>
              {/* Call-control chips */}
              <span className="absolute inset-x-[4px] bottom-[3px] flex justify-center gap-[3px]">
                <span className="h-[5px] w-[10px] rounded-[2.5px] bg-white/30" />
                <span className="h-[5px] w-[10px] rounded-[2.5px] bg-[#ff5a5a]/70" />
                <span className="h-[5px] w-[10px] rounded-[2.5px] bg-white/30" />
              </span>
              {/* Glass sheen */}
              <Sheen className="left-0 opacity-55" duration="5.2s" />
            </span>
          </span>
          {/* Monitor stand */}
          <span className="absolute bottom-[9px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 bg-[#4a44a0]" />
          <span className="absolute bottom-[6px] left-1/2 h-[3px] w-[22px] -translate-x-1/2 rounded-[2px]" style={{ background: "linear-gradient(180deg, #5d56b8, #3b3480)", boxShadow: "0 2px 4px rgba(60,50,140,0.45)" }} />
          {/* Waveform on its own plinth */}
          <span className="absolute bottom-[0px] left-1/2 flex h-[12px] w-[40px] -translate-x-1/2 items-end justify-center gap-[2.5px] rounded-[3px] bg-[#e7e3fb]/85 px-[4px] pb-[1px]" style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8)" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="wave-bar w-[3px] rounded-full bg-indigo-500"
                style={{ height: `${4 + (i % 3) * 2.5}px`, animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        </span>
        <GroundShadow className="inset-x-5" color="rgba(70,60,160,0.32)" />
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  AI TRIAGE - medical AI core with heartbeat waveform + scan         */
/* ------------------------------------------------------------------ */

export function TriageVisual() {
  return (
    <>
      <span aria-hidden className="absolute inset-0">
        <span className="obj-float absolute inset-0">
          {/* AI core orb — layered sphere with inner glow core */}
          <span
            className="ai-core absolute left-1/2 top-[38%] h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle at 34% 28%, #b9f5ea 0%, #2dd4bf 38%, #0d9488 68%, #0b5f57 100%)",
              boxShadow: "inset -4px -5px 8px rgba(6,60,54,0.6), inset 3px 4px 6px rgba(255,255,255,0.5), 0 6px 12px rgba(15,120,110,0.4)",
            }}
          >
            {/* Inner glass dome */}
            <span className="absolute inset-[6px] rounded-full" style={{ background: "radial-gradient(circle at 40% 32%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.12) 55%, transparent 75%)" }} />
            {/* Heartbeat waveform running through the core */}
            <svg aria-hidden viewBox="0 0 42 42" className="absolute inset-0 h-full w-full">
              <polyline className="ecg-trace" points="4,22 12,22 15,12 20,32 24,18 27,22 38,22" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Orbiting particles */}
            <span className="orbit-particle absolute left-1/2 top-1/2 h-[3.5px] w-[3.5px] rounded-full bg-white/95" />
            <span className="orbit-particle absolute left-1/2 top-1/2 h-[2.5px] w-[2.5px] rounded-full bg-teal-100/90" style={{ animationDelay: "1.2s" }} />
            <span className="orbit-particle absolute left-1/2 top-1/2 h-[2px] w-[2px] rounded-full bg-teal-200/80" style={{ animationDelay: "2.4s" }} />
          </span>
          {/* Scan line moving across the core */}
          <span className="scan-bar absolute left-[8px] right-[8px] top-[16px] h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-teal-100/90 to-transparent" />
          {/* Health pulse halo */}
          <span aria-hidden className="ring-ping absolute left-1/2 top-[38%] h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-400/50" />
          <GroundShadow className="inset-x-6" color="rgba(15,120,110,0.32)" />
        </span>
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export type SceneKey =
  | "hospitals" | "opd" | "blood" | "appointments" | "medicines"
  | "records" | "diagnostics" | "emergency" | "insurance"
  | "family" | "consultation" | "triage";

export const SCENES: Record<SceneKey, React.ComponentType> = {
  hospitals: HospitalVisual,
  opd: OpdVisual,
  blood: BloodVisual,
  appointments: AppointmentsVisual,
  medicines: MedicineVisual,
  records: RecordsVisual,
  diagnostics: DiagnosticsVisual,
  emergency: EmergencyVisual,
  insurance: InsuranceVisual,
  family: FamilyVisual,
  consultation: ConsultationVisual,
  triage: TriageVisual,
};
