import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export const DISCO_FRAME_COUNT = 300;
export function frameAtProgress(progress: number) {
  return Math.round(
    Math.max(0, Math.min(1, progress)) * (DISCO_FRAME_COUNT - 1)
  );
}
const frameUrl = (frame: number) =>
  `/images/disco-frames/${String(frame + 1).padStart(3, "0")}.jpg`;

/** A scroll-scrubbed image sequence. Only a small neighborhood is decoded at once. */
export default function ScrollDisco() {
  const worldRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const world = worldRef.current;
    const poster = posterRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!world || !canvas || !context) return;
    canvas.style.opacity = "0";
    if (poster) poster.style.opacity = "1";
    let disposed = false;
    let raf = 0;
    let desired = 0;
    let drawn = -1;
    let lastImage: HTMLImageElement | null = null;
    let width = 0;
    let height = 0;
    const cache = new Map<number, HTMLImageElement>();
    const pending = new Map<number, HTMLImageElement>();
    const failed = new Set<number>();

    const stageColor = "#0d071b";
    const foreground = document.createElement("canvas");
    foreground.width = 800;
    foreground.height = 720;
    const foregroundContext = foreground.getContext("2d");

    function cropAtFrame(index: number) {
      // Start close enough to appreciate the mirror tiles, then pull back
      // before the ball separates so every loose piece stays in the viewport.
      const progress = Math.min(1, Math.max(0, index / 99));
      const eased = 1 - Math.pow(1 - progress, 3);
      return {
        x: 390 - 150 * eased,
        y: 100 - 100 * eased,
        width: 500 + 300 * eased,
        height: 510 + 210 * eased,
        featherX: 60 - 25 * eased,
        featherTop: 60 - 45 * eased,
        featherBottom: 70 - 50 * eased,
      };
    }

    function geometryAtFrame(index: number) {
      const crop = cropAtFrame(index);
      const mobile = width <= 759;
      const regionWidth = width * (mobile ? 0.97 : 0.46);
      const regionHeight = height * (mobile ? 0.46 : 0.74);
      const scale = Math.min(
        regionWidth / crop.width,
        regionHeight / crop.height
      );
      const centerX = width * 0.5;
      const centerY = mobile
        ? height * (0.46 - 0.14 * Math.min(1, Math.max(0, index / 40)))
        : height * 0.52;
      const imageWidth = crop.width * scale;
      const imageHeight = crop.height * scale;
      return {
        crop,
        scale,
        imageWidth,
        imageHeight,
        left: centerX - imageWidth / 2,
        top: centerY - imageHeight / 2,
      };
    }

    function draw(index: number, img: HTMLImageElement) {
      if (
        !context ||
        !canvas ||
        !foregroundContext ||
        width <= 0 ||
        height <= 0
      )
        return;
      // Preserve an open middle on desktop and an open lower half on mobile
      // for the chapter typography, while ambient light fills the whole viewport.
      const { crop, imageWidth, imageHeight, left, top } =
        geometryAtFrame(index);
      context.fillStyle = stageColor;
      context.fillRect(0, 0, width, height);

      // Fill the complete stage with the photo's own diffuse colored light.
      // Only this ambient layer is dimmed; the foreground retains its exposure.
      const ambientScale = Math.max((width + 120) / 1280, (height + 120) / 720);
      context.save();
      context.filter = "blur(30px)";
      context.globalAlpha = 0.5;
      context.drawImage(
        img,
        (width - 1280 * ambientScale) / 2,
        (height - 720 * ambientScale) / 2,
        1280 * ambientScale,
        720 * ambientScale
      );
      context.restore();

      foregroundContext.clearRect(0, 0, 800, 720);
      foregroundContext.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      // Fade the source background to transparency, revealing the ambient layer
      // rather than introducing a rectangular border around the photograph.
      foregroundContext.save();
      foregroundContext.globalCompositeOperation = "destination-out";
      const edges = [
        [0, 0, crop.featherX, 0, 0, 0, crop.featherX, crop.height],
        [
          crop.width,
          0,
          crop.width - crop.featherX,
          0,
          crop.width - crop.featherX,
          0,
          crop.featherX,
          crop.height,
        ],
        [0, 0, 0, crop.featherTop, 0, 0, crop.width, crop.featherTop],
        [
          0,
          crop.height,
          0,
          crop.height - crop.featherBottom,
          0,
          crop.height - crop.featherBottom,
          crop.width,
          crop.featherBottom,
        ],
      ];
      for (const [x0, y0, x1, y1, x, y, edgeWidth, edgeHeight] of edges) {
        const mask = foregroundContext.createLinearGradient(x0, y0, x1, y1);
        mask.addColorStop(0, "rgba(0, 0, 0, 1)");
        mask.addColorStop(1, "rgba(0, 0, 0, 0)");
        foregroundContext.fillStyle = mask;
        foregroundContext.fillRect(x, y, edgeWidth, edgeHeight);
      }
      foregroundContext.restore();
      context.drawImage(
        foreground,
        0,
        0,
        crop.width,
        crop.height,
        left,
        top,
        imageWidth,
        imageHeight
      );
      drawn = index;
      lastImage = img;
      canvas.dataset.frame = String(index + 1);
      canvas.style.opacity = "1";
      if (poster) poster.style.opacity = "0";
      if (countRef.current)
        countRef.current.textContent = `${String(index + 1).padStart(3, "0")} / 300`;
    }
    function pump() {
      if (disposed) return;
      const priority = [desired];
      if (!reduced)
        for (let offset = 1; offset <= 8; offset++)
          priority.push(desired + offset, desired - offset);
      for (const index of priority) {
        if (pending.size >= 4) break;
        if (
          index < 0 ||
          index >= DISCO_FRAME_COUNT ||
          cache.has(index) ||
          pending.has(index) ||
          failed.has(index)
        )
          continue;
        const img = new Image();
        img.decoding = "async";
        pending.set(index, img);
        img.onload = () => {
          if (disposed) return;
          pending.delete(index);
          cache.set(index, img);
          // Evict frames furthest from the playhead, never retain all 300 decoded JPGs.
          if (cache.size > 24) {
            const furthest = Array.from(cache.keys()).sort(
              (a, b) => Math.abs(b - desired) - Math.abs(a - desired)
            )[0];
            cache.delete(furthest);
          }
          if (index === desired || !lastImage) draw(index, img);
          pump();
        };
        img.onerror = () => {
          pending.delete(index);
          failed.add(index);
          pump();
        };
        img.src = frameUrl(index);
      }
    }
    function update() {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      desired = reduced ? 0 : frameAtProgress(progress);
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${progress})`;
      document.documentElement.style.setProperty(
        "--scroll-shift",
        `${-progress * 450}px`
      );
      document.documentElement.style.setProperty(
        "--scroll-turn",
        String(progress * 360)
      );
      const img = cache.get(desired);
      if (img && desired !== drawn) draw(desired, img);
      pump();
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    function resize() {
      if (!world || !canvas || !context) return;
      const bounds = world.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (width <= 0 || height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingQuality = "high";
      if (poster) {
        const { crop, scale, left, top } = geometryAtFrame(0);
        // Match the opening crop and reserved region before canvas is ready.
        poster.style.width = `${1280 * scale}px`;
        poster.style.height = `${720 * scale}px`;
        poster.style.left = `${left - crop.x * scale}px`;
        poster.style.top = `${top - crop.y * scale}px`;
      }
      if (lastImage) draw(drawn, lastImage);
      schedule();
    }
    const stageObserver = new ResizeObserver(resize);
    stageObserver.observe(world);
    const pageObserver = new ResizeObserver(schedule);
    pageObserver.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stageObserver.disconnect();
      pageObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      for (const img of Array.from(pending.values())) {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      }
      pending.clear();
      cache.clear();
      document.documentElement.style.removeProperty("--scroll-shift");
      document.documentElement.style.removeProperty("--scroll-turn");
    };
  }, [reduced]);

  return (
    <>
      <div ref={worldRef} className="sequence-world" aria-hidden="true">
        <img
          ref={posterRef}
          className="sequence-poster"
          style={{
            position: "absolute",
            maxWidth: "none",
            objectFit: "fill",
            clipPath: "inset(13.8888889% 30.46875% 15.2777778%)",
            opacity: 1,
          }}
          src={frameUrl(0)}
          alt=""
          fetchPriority="high"
        />
        <canvas
          ref={canvasRef}
          className="sequence-canvas"
          style={{ opacity: 0 }}
        />
      </div>
      <div className="reading-progress" ref={progressRef} aria-hidden="true" />
      <div className="sequence-readout" aria-hidden="true">
        <span className="readout-dot" />
        {reduced ? "STILL MODE" : "SCROLL TO UNFOLD"}
        <span ref={countRef}>001 / 300</span>
      </div>
    </>
  );
}
