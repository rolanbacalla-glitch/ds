import * as React from "react";

export interface MediaIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
  label?: string;
}

function baseProps(size: number | string = 24, label?: string) {
  const isDecorative = !label;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": isDecorative ? true : undefined,
    "aria-label": isDecorative ? undefined : label,
    role: isDecorative ? undefined : "img",
  } as const;
}

/** Spotify brand emblem (24x24 optical grid) */
export function SpotifyIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.5 9.6c2.9-.85 6.4-.55 9.1 1" />
      <path d="M8.3 12.7c2.4-.7 5.2-.45 7.4.85" />
      <path d="M9.1 15.6c1.9-.5 4.1-.3 5.8.65" />
    </svg>
  );
}

/** Apple AirPlay Video / Screen icon */
export function AirplayIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <polygon points="12 15 17 21 7 21 12 15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Apple AirPlay Audio concentric waves icon */
export function AirplayAudioIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.34 15.66a8 8 0 1 1 11.32 0" />
      <path d="M9.17 12.83a4 4 0 1 1 5.66 0" />
      <polygon points="12 14.5 16.5 20.5 7.5 20.5 12 14.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Spotify Connect / AirPlay speaker & broadcast icon */
export function SpotifyAirplayIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="12" height="16" rx="2.5" />
      <circle cx="9" cy="14" r="2.75" />
      <circle cx="9" cy="8" r="1" fill="currentColor" stroke="none" />
      <path d="M18.2 9.5a4.5 4.5 0 0 1 0 5" />
      <path d="M20.6 7a8 8 0 0 1 0 10" />
    </svg>
  );
}

/** Google Cast / Chromecast icon */
export function CastIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
      <path d="M2 12a9 9 0 0 1 8 8" />
      <path d="M2 16a5 5 0 0 1 4 4" />
      <circle cx="2.5" cy="19.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Active Google Cast Connected icon */
export function CastConnectedIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
      <rect x="6" y="7" width="12" height="7" rx="1" fill="currentColor" fillOpacity="0.25" />
      <path d="M2 12a9 9 0 0 1 8 8" />
      <path d="M2 16a5 5 0 0 1 4 4" />
      <circle cx="2.5" cy="19.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Bluetooth Audio streaming icon */
export function BluetoothAudioIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6.5 6.5 9 9-4.5 4.5V4l4.5 4.5-9 9" />
      <path d="M18.5 9.5a4 4 0 0 1 0 5" />
      <path d="M21 7a7.5 7.5 0 0 1 0 10" />
    </svg>
  );
}

/** Lossless / Hi-Res Audio waveform icon */
export function LosslessAudioIcon({ size = 24, strokeWidth = 1.8, label, ...props }: MediaIconProps) {
  return (
    <svg {...baseProps(size, label)} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h2l2-5 3 10 3-12 3 12 2-5h3" />
    </svg>
  );
}
