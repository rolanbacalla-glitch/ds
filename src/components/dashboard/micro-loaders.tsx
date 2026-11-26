"use client";

import React from "react";

export type MicroLoaderCategory =
  | "circular"
  | "dots"
  | "linear"
  | "bars"
  | "geometric"
  | "radar";

export interface MicroLoaderSpec {
  id: string;
  name: string;
  category: MicroLoaderCategory;
  useCase: string;
  description: string;
  tags: string[];
  render: () => React.ReactNode;
}

const RING_8_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const BLADE_12_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Number((cx + r * Math.cos(rad)).toFixed(2)),
    y: Number((cy + r * Math.sin(rad)).toFixed(2)),
  };
}

export const MICRO_LOADERS: MicroLoaderSpec[] = [
  /* ===================== CIRCULAR SPINNERS & RINGS ===================== */
  {
    id: "segment-ring",
    name: "Segment Ring",
    category: "circular",
    useCase: "General loading",
    description: "Clean circular track with a rotating 120° primary arc and rounded caps.",
    tags: ["spinner", "ring", "circular", "track", "arc"],
    render: () => (
      <>
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-outline)"
          strokeWidth="4.2"
        />
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="34 67"
          className="ml-spin"
        />
      </>
    ),
  },
  {
    id: "comet-spinner",
    name: "Comet Spinner",
    category: "circular",
    useCase: "Inline button wait",
    description: "Minimalist 95° orbiting arc without a background track for compact surfaces.",
    tags: ["spinner", "comet", "minimal", "button", "arc"],
    render: () => (
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="none"
        stroke="var(--sys-primary)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="28 73"
        className="ml-spin"
      />
    ),
  },
  {
    id: "half-ring",
    name: "Half Ring Spinner",
    category: "circular",
    useCase: "Page & panel load",
    description: "Full tonal track paired with a bold 180° primary semicircle.",
    tags: ["spinner", "half", "ring", "track"],
    render: () => (
      <>
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-outline)"
          strokeWidth="4.2"
        />
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="50 51"
          className="ml-spin"
        />
      </>
    ),
  },
  {
    id: "dual-ring",
    name: "Dual Ring Loader",
    category: "circular",
    useCase: "Data sync",
    description: "Two concentric counter-rotating arcs pairing primary ink and brand accent.",
    tags: ["dual", "concentric", "sync", "ring"],
    render: () => (
      <>
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="var(--sys-on-surface)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeDasharray="48 60"
          className="ml-spin"
        />
        <circle
          cx="24"
          cy="24"
          r="10.5"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeDasharray="30 38"
          className="ml-spin-reverse"
        />
      </>
    ),
  },
  {
    id: "synced-dual-ring",
    name: "Synced Dual Ring",
    category: "circular",
    useCase: "API handshake",
    description: "Split ring composed of two opposing 135° arcs rotating in synchronised harmony.",
    tags: ["split", "ring", "sync", "circular"],
    render: () => (
      <g className="ml-spin">
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="36 65"
        />
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-on-surface)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeDasharray="36 65"
          strokeDashoffset="-50"
        />
      </g>
    ),
  },
  {
    id: "blade-spinner",
    name: "Blade Spinner",
    category: "circular",
    useCase: "System activity",
    description: "Twelve radial pill spokes fading sequentially around the dial.",
    tags: ["ios", "activity", "blade", "radial", "spokes"],
    render: () => (
      <>
        {BLADE_12_ANGLES.map((angle, i) => (
          <rect
            key={angle}
            x="22.5"
            y="6"
            width="3"
            height="8.5"
            rx="1.5"
            fill="var(--sys-on-surface)"
            transform={`rotate(${angle} 24 24)`}
            className="ml-fade"
            style={{ animationDelay: `calc(${(i * 0.09).toFixed(2)}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },

  /* ===================== DOT & MATRIX PATTERNS ===================== */
  {
    id: "pulse-dots-ring",
    name: "Pulse Dots Ring",
    category: "dots",
    useCase: "Processing state",
    description: "Eight circular dots arranged in a ring with a smooth chasing opacity fade.",
    tags: ["dots", "ring", "pulse", "fade"],
    render: () => (
      <>
        {RING_8_ANGLES.map((angle, i) => {
          const { x, y } = polarPoint(24, 24, 15.5, angle);
          return (
            <circle
              key={angle}
              cx={x}
              cy={y}
              r="3.4"
              fill="var(--sys-on-surface)"
              className="ml-fade"
              style={{ animationDelay: `calc(${(i * 0.13).toFixed(2)}s / var(--ml-speed, 1))` }}
            />
          );
        })}
      </>
    ),
  },
  {
    id: "dot-ring-scale",
    name: "Dot Ring Scale",
    category: "dots",
    useCase: "Background task",
    description: "Eight brand-accent dots pulsing in diameter around a radial path.",
    tags: ["dots", "scale", "ring", "spinner"],
    render: () => (
      <>
        {RING_8_ANGLES.map((angle, i) => {
          const { x, y } = polarPoint(24, 24, 15.5, angle);
          return (
            <circle
              key={angle}
              cx={x}
              cy={y}
              r="3.4"
              fill="var(--sys-primary)"
              className="ml-dot-scale"
              style={{ animationDelay: `calc(${(i * 0.14).toFixed(2)}s / var(--ml-speed, 1))` }}
            />
          );
        })}
      </>
    ),
  },
  {
    id: "bounce-dots",
    name: "Bounce Dots",
    category: "dots",
    useCase: "AI thinking & chat",
    description: "Three horizontal dots bouncing in sequence for conversational typing states.",
    tags: ["dots", "bounce", "typing", "chat", "ai"],
    render: () => (
      <>
        {[12, 24, 36].map((cx, i) => (
          <circle
            key={cx}
            cx={cx}
            cy="26"
            r="4"
            fill={i === 1 ? "var(--sys-primary)" : "var(--sys-on-surface)"}
            className="ml-bounce"
            style={{ animationDelay: `calc(${(i * 0.16).toFixed(2)}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },
  {
    id: "dot-row-wave",
    name: "Dot Row Wave",
    category: "dots",
    useCase: "Streaming response",
    description: "Five dots undulating smoothly along a horizontal sine curve.",
    tags: ["wave", "dots", "sine", "stream"],
    render: () => (
      <>
        {[8, 16, 24, 32, 40].map((cx, i) => (
          <circle
            key={cx}
            cx={cx}
            cy="24"
            r="3"
            fill={i === 2 ? "var(--sys-primary)" : "var(--sys-on-surface)"}
            className="ml-wave-y"
            style={{ animationDelay: `calc(${(i * 0.12).toFixed(2)}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },
  {
    id: "dot-grid-wave",
    name: "Dot Grid Wave",
    category: "dots",
    useCase: "Matrix compute",
    description: "A 3×3 matrix of nine dots rippling diagonally across the grid.",
    tags: ["grid", "matrix", "dots", "compute", "ai"],
    render: () => {
      const coords = [12, 24, 36];
      return (
        <>
          {coords.map((cy, row) =>
            coords.map((cx, col) => (
              <circle
                key={`${row}-${col}`}
                cx={cx}
                cy={cy}
                r="3.2"
                fill={(row + col) % 2 === 0 ? "var(--sys-on-surface)" : "var(--sys-primary)"}
                className="ml-grid-pulse"
                style={{
                  animationDelay: `calc(${((row + col) * 0.14).toFixed(2)}s / var(--ml-speed, 1))`,
                }}
              />
            ))
          )}
        </>
      );
    },
  },
  {
    id: "orbit-comet-dots",
    name: "Orbit Comet Dots",
    category: "dots",
    useCase: "Orbital sync",
    description: "Tapering comet trail of six primary dots orbiting continuously.",
    tags: ["orbit", "comet", "dots", "trail"],
    render: () => {
      const trail = [
        { angle: 0, r: 3.8, op: 1 },
        { angle: -28, r: 3.3, op: 0.85 },
        { angle: -54, r: 2.8, op: 0.68 },
        { angle: -78, r: 2.3, op: 0.5 },
        { angle: -100, r: 1.8, op: 0.34 },
        { angle: -120, r: 1.3, op: 0.2 },
      ];
      return (
        <g className="ml-spin">
          {trail.map((dot) => {
            const { x, y } = polarPoint(24, 24, 15.5, dot.angle);
            return (
              <circle
                key={dot.angle}
                cx={x}
                cy={y}
                r={dot.r}
                fill="var(--sys-primary)"
                opacity={dot.op}
              />
            );
          })}
        </g>
      );
    },
  },

  /* ===================== LINEAR & PROGRESS LOADERS ===================== */
  {
    id: "progress-bar-fill",
    name: "Progress Bar Fill",
    category: "linear",
    useCase: "File upload",
    description: "Rounded pill track with a smooth left-to-right filling bar.",
    tags: ["progress", "bar", "linear", "upload", "pill"],
    render: () => (
      <>
        <rect x="4" y="20" width="40" height="8" rx="4" fill="var(--sys-outline)" />
        <rect
          x="4"
          y="20"
          width="40"
          height="8"
          rx="4"
          fill="var(--sys-primary)"
          className="ml-bar-fill"
        />
      </>
    ),
  },
  {
    id: "indeterminate-bar",
    name: "Indeterminate Bar",
    category: "linear",
    useCase: "Unknown duration",
    description: "Pill track with a clipped primary capsule gliding endlessly across.",
    tags: ["indeterminate", "bar", "linear", "track"],
    render: () => (
      <>
        <rect x="4" y="20" width="40" height="8" rx="4" fill="var(--sys-outline)" />
        <svg
          x="4"
          y="20"
          width="40"
          height="8"
          viewBox="0 0 40 8"
          style={{ clipPath: "inset(0 round 4px)" }}
        >
          <rect
            x="0"
            y="0"
            width="18"
            height="8"
            rx="4"
            fill="var(--sys-primary)"
            className="ml-bar-indeterminate"
          />
        </svg>
      </>
    ),
  },
  {
    id: "scanner-bar",
    name: "Scanner Bar",
    category: "linear",
    useCase: "Search & indexing",
    description: "Back-and-forth sweeping pill inside a tonal channel.",
    tags: ["scanner", "sweep", "search", "bar"],
    render: () => (
      <>
        <rect x="4" y="20" width="40" height="8" rx="4" fill="var(--sys-outline)" />
        <rect
          x="4"
          y="20"
          width="18"
          height="8"
          rx="4"
          fill="var(--sys-primary)"
          className="ml-bar-scan"
        />
      </>
    ),
  },
  {
    id: "segmented-progress",
    name: "Segmented Progress",
    category: "linear",
    useCase: "Multi-step pipeline",
    description: "Five rounded squares stepping sequentially across a horizontal queue.",
    tags: ["segmented", "steps", "pipeline", "squares"],
    render: () => (
      <>
        {[5, 13, 21, 29, 37].map((x, i) => (
          <rect
            key={x}
            x={x}
            y="20"
            width="6"
            height="8"
            rx="2"
            fill="var(--sys-primary)"
            className="ml-fade"
            style={{ animationDelay: `calc(${(i * 0.16).toFixed(2)}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },

  /* ===================== AUDIO & EQUALISER BARS ===================== */
  {
    id: "equaliser-bars",
    name: "Equaliser Bars",
    category: "bars",
    useCase: "Audio & voice AI",
    description: "Five vertical rounded bars with a highlighted primary centre column.",
    tags: ["equaliser", "audio", "voice", "bars", "sound"],
    render: () => {
      const bars = [
        { x: 8, delay: 0 },
        { x: 15, delay: 0.2 },
        { x: 22, delay: 0.1, primary: true },
        { x: 29, delay: 0.35 },
        { x: 36, delay: 0.15 },
      ];
      return (
        <>
          {bars.map((bar) => (
            <rect
              key={bar.x}
              x={bar.x}
              y="10"
              width="4"
              height="28"
              rx="2"
              fill={bar.primary ? "var(--sys-primary)" : "var(--sys-on-surface)"}
              className="ml-eq-bar"
              style={{ animationDelay: `calc(${bar.delay}s / var(--ml-speed, 1))` }}
            />
          ))}
        </>
      );
    },
  },
  {
    id: "bar-wave",
    name: "Bar Wave",
    category: "bars",
    useCase: "Live telemetry",
    description: "Six slender vertical bars oscillating from the centre axis like a waveform.",
    tags: ["wave", "bars", "telemetry", "sound"],
    render: () => (
      <>
        {[7, 13.5, 20, 26.5, 33, 39.5].map((x, i) => (
          <rect
            key={x}
            x={x - 1.75}
            y="11"
            width="3.5"
            height="26"
            rx="1.75"
            fill="var(--sys-on-surface)"
            className="ml-eq-bar-centre"
            style={{ animationDelay: `calc(${(i * 0.11).toFixed(2)}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },
  {
    id: "growing-bars",
    name: "Growing Bars",
    category: "bars",
    useCase: "Analytics refresh",
    description: "Three chunky chart-inspired vertical bars pulsing rhythmically.",
    tags: ["bars", "chart", "analytics", "growing"],
    render: () => (
      <>
        {[
          { x: 11, delay: 0, primary: false },
          { x: 21, delay: 0.22, primary: true },
          { x: 31, delay: 0.44, primary: false },
        ].map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y="10"
            width="6"
            height="28"
            rx="3"
            fill={bar.primary ? "var(--sys-primary)" : "var(--sys-on-surface)"}
            className="ml-eq-bar"
            style={{ animationDelay: `calc(${bar.delay}s / var(--ml-speed, 1))` }}
          />
        ))}
      </>
    ),
  },

  /* ===================== GEOMETRIC & FOLDING SHAPES ===================== */
  {
    id: "rotating-square",
    name: "Rotating Square",
    category: "geometric",
    useCase: "Workspace boot",
    description: "Thick-stroked hollow rounded square turning in crisp 90° eased steps.",
    tags: ["square", "diamond", "geometric", "rotate"],
    render: () => (
      <rect
        x="11"
        y="11"
        width="26"
        height="26"
        rx="5"
        fill="none"
        stroke="var(--sys-primary)"
        strokeWidth="4.6"
        className="ml-square-turn"
      />
    ),
  },
  {
    id: "hexagon-spin",
    name: "Hexagon Spin",
    category: "geometric",
    useCase: "Build & compile",
    description: "Rounded hollow hexagon rotating smoothly for technical build states.",
    tags: ["hexagon", "polygon", "geometric", "spin"],
    render: () => (
      <polygon
        points="24,7 38.5,15.5 38.5,32.5 24,41 9.5,32.5 9.5,15.5"
        fill="none"
        stroke="var(--sys-primary)"
        strokeWidth="4.2"
        strokeLinejoin="round"
        className="ml-hex-spin"
      />
    ),
  },
  {
    id: "folding-squares",
    name: "Folding Squares",
    category: "geometric",
    useCase: "Module assembly",
    description: "Four diamond-tilted squares pulsing in a staggered clockwise fold.",
    tags: ["folding", "squares", "tiles", "geometric"],
    render: () => (
      <g transform="rotate(45 24 24)">
        {[
          { x: 12, y: 12, delay: 0, primary: true },
          { x: 25, y: 12, delay: 0.25, primary: false },
          { x: 25, y: 25, delay: 0.5, primary: true },
          { x: 12, y: 25, delay: 0.75, primary: false },
        ].map((sq) => (
          <rect
            key={`${sq.x}-${sq.y}`}
            x={sq.x}
            y={sq.y}
            width="11"
            height="11"
            rx="2.5"
            fill={sq.primary ? "var(--sys-primary)" : "var(--sys-on-surface)"}
            className="ml-fold"
            style={{ animationDelay: `calc(${sq.delay}s / var(--ml-speed, 1))` }}
          />
        ))}
      </g>
    ),
  },

  /* ===================== RADAR & RIPPLE PULSES ===================== */
  {
    id: "radar-pulse",
    name: "Radar Pulse",
    category: "radar",
    useCase: "Live discovery",
    description: "Solid centre beacon surrounded by two concentric expanding radar rings.",
    tags: ["radar", "sonar", "pulse", "live", "discovery"],
    render: () => (
      <>
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="3"
          className="ml-ripple"
        />
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="3"
          className="ml-ripple"
          style={{ animationDelay: "calc(0.8s / var(--ml-speed, 1))" }}
        />
        <circle cx="24" cy="24" r="5" fill="var(--sys-on-surface)" />
      </>
    ),
  },
  {
    id: "double-ripple",
    name: "Double Ripple",
    category: "radar",
    useCase: "Presence & heartbeat",
    description: "Soft outward water-ripple rings radiating from a focal status dot.",
    tags: ["ripple", "heartbeat", "status", "pulse"],
    render: () => (
      <>
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-outline)"
          strokeWidth="4"
          className="ml-ripple"
        />
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="var(--sys-primary)"
          strokeWidth="2.5"
          className="ml-ripple"
          style={{ animationDelay: "calc(0.55s / var(--ml-speed, 1))" }}
        />
        <circle cx="24" cy="24" r="4.5" fill="var(--sys-on-surface)" />
      </>
    ),
  },
];

interface MicroLoaderPreviewProps {
  loader: MicroLoaderSpec;
  size?: number;
  speed?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

export const MicroLoaderPreview: React.FC<MicroLoaderPreviewProps> = ({
  loader,
  size = 48,
  speed = 1,
  paused = false,
  reducedMotion = false,
  className,
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={`${loader.name} loading animation`}
      data-ml-paused={paused ? "true" : undefined}
      data-ml-reduced={reducedMotion ? "true" : undefined}
      className={`ml-svg shrink-0 ${className ?? ""}`}
      style={{ "--ml-speed": speed } as React.CSSProperties}
    >
      {loader.render()}
    </svg>
  );
};

export function buildLoaderReactSnippet(loader: MicroLoaderSpec, size: number, speed: number): string {
  const componentName = loader.name.replace(/[^a-zA-Z0-9]+/g, "") + "Loader";
  return `import { MicroLoaderPreview, MICRO_LOADERS } from "@/components/dashboard/micro-loaders";

export function ${componentName}() {
  const spec = MICRO_LOADERS.find((item) => item.id === "${loader.id}")!;
  return <MicroLoaderPreview loader={spec} size={${size}} speed={${speed}} />;
}`;
}
