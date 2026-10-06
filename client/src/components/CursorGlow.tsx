import { useEffect, useRef } from "react";

/** A little light under the system pointer; never replaces or hides it. */
export default function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!glow.current) return;
        glow.current.style.transform = `translate3d(${event.clientX - 65}px, ${event.clientY - 65}px, 0)`;
        glow.current.style.opacity = "1";
      });
    };
    const hide = () => {
      cancelAnimationFrame(frame);
      if (glow.current) glow.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    media.addEventListener("change", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      media.removeEventListener("change", hide);
    };
  }, []);
  return <div ref={glow} className="pointer-glow" aria-hidden="true" />;
}
