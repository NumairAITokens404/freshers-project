import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
} from "react";

type GlowCardProps = HTMLAttributes<HTMLDivElement> & {
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
};
const hues = { blue: 220, purple: 280, green: 100, red: 0, orange: 30 };

/** Adapted from the supplied spotlight card: local coordinates keep the edge
 * light aligned while cards scroll, without blocking native touch gestures. */
export function GlowCard({
  children,
  className = "",
  glowColor = "purple",
  size = "md",
  width,
  height,
  customSize = true,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: GlowCardProps) {
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty(
        "--glow-x",
        `${event.clientX - bounds.left}px`
      );
      event.currentTarget.style.setProperty(
        "--glow-y",
        `${event.clientY - bounds.top}px`
      );
      event.currentTarget.style.setProperty(
        "--glow-hue",
        String(hues[glowColor] + (event.clientX / window.innerWidth) * 90)
      );
      event.currentTarget.style.setProperty("--glow-active", "1");
    }
    onPointerMove?.(event);
  }
  return (
    <div
      {...props}
      data-glow
      className={`glow-card ${customSize ? "" : `glow-card--${size}`} ${className}`}
      style={
        {
          width,
          height,
          "--glow-hue": hues[glowColor],
          ...style,
        } as CSSProperties
      }
      onPointerMove={move}
      onPointerLeave={event => {
        event.currentTarget.style.setProperty("--glow-active", "0");
        onPointerLeave?.(event);
      }}
    >
      {children}
      <span className="glow-card__edge" aria-hidden="true" />
      <span className="glow-card__bloom" aria-hidden="true" />
    </div>
  );
}
