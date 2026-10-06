import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/** Mounted only by the confirmed-pass state, after validation and persistence. */
export default function PartyPopper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || !context || reduced.matches) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);
    const colors = ["#ff8de5", "#e6ff70", "#b59aff", "#ffbe79", "#fff7ee"];
    const pieces = Array.from({ length: 150 }, (_, index) => {
      const side = index % 2;
      return {
        x: side ? width + 12 : -12,
        y: height * 0.7,
        vx: (side ? -1 : 1) * (4 + Math.random() * 11),
        vy: -10 - Math.random() * 12,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.24,
        width: 4 + Math.random() * 6,
        height: 5 + Math.random() * 10,
        color: colors[index % colors.length],
      };
    });
    let frame = 0;
    let started = 0;
    let last = 0;
    function draw(now: number) {
      if (!context || !canvas) return;
      if (!started) started = now;
      const elapsed = now - started;
      const step = Math.min((now - (last || now)) / 16.67, 2);
      last = now;
      context.clearRect(0, 0, width, height);
      if (elapsed > 3700 || reduced.matches) return;
      context.globalAlpha = Math.min(1, (3700 - elapsed) / 700);
      for (const piece of pieces) {
        piece.x += piece.vx * step;
        piece.y += piece.vy * step;
        piece.vy += 0.19 * step;
        piece.vx *= Math.pow(0.989, step);
        piece.angle += piece.spin * step;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.color;
        context.fillRect(
          -piece.width / 2,
          -piece.height / 2,
          piece.width,
          piece.height * Math.cos(elapsed / 170 + piece.angle)
        );
        context.restore();
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return createPortal(
    <canvas ref={canvasRef} className="party-popper" aria-hidden="true" />,
    document.body
  );
}
