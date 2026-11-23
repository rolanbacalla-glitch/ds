import * as React from "react";

export type IconLibrary = "lucide" | "phosphor" | "material";
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export const ICON_SIZE_MAP: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export interface IconWrapperProps extends React.SVGAttributes<SVGElement> {
  /** Semantic size token mapped to the 8px spatial grid. */
  size?: IconSize | number;
  /** Accessible label. Omit (or leave empty) for decorative icons so aria-hidden="true" is applied. */
  label?: string;
  /** Render any tree-shaken Lucide or Phosphor icon component directly. */
  as: React.ComponentType<{
    size?: number | string;
    className?: string;
    "aria-hidden"?: boolean;
    "aria-label"?: string;
    role?: string;
  }>;
  className?: string;
}

/**
 * Antigravity unified icon adapter.
 * Accepts any tree-shaken icon from Lucide, Phosphor, Heroicons, Tabler, etc.,
 * enforcing consistent sizing and WCAG 2.2 decorative/semantic ARIA attributes.
 */
export function AntigravityIcon({
  as: IconComponent,
  size = "md",
  label,
  className,
}: IconWrapperProps) {
  const pixelSize = typeof size === "number" ? size : ICON_SIZE_MAP[size];
  const isDecorative = !label;

  return (
    <IconComponent
      size={pixelSize}
      className={className}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : label}
      role={isDecorative ? undefined : "img"}
    />
  );
}

export interface MaterialSymbolProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols / Icons ligature name, e.g. "palette", "layers". */
  name: string;
  size?: IconSize | number;
  label?: string;
}

/**
 * Lightweight Material Symbols adapter for teams using Google Material Icons alongside Lucide/Phosphor.
 */
export function MaterialSymbol({
  name,
  size = "md",
  label,
  className = "",
  style,
  ...props
}: MaterialSymbolProps) {
  const pixelSize = typeof size === "number" ? size : ICON_SIZE_MAP[size];
  const isDecorative = !label;

  return (
    <span
      className={`material-symbols-rounded select-none leading-none inline-flex items-center justify-center ${className}`.trim()}
      style={{ fontSize: pixelSize, width: pixelSize, height: pixelSize, ...style }}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : label}
      role={isDecorative ? undefined : "img"}
      {...props}
    >
      {name}
    </span>
  );
}
