import { useEffect, useRef, useState } from "react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { memories, type Memory } from "@/lib/memories";

function MemoryImage({ memory }: { memory: Memory }) {
  const [failedToLoad, setFailedToLoad] = useState(false);

  if (!memory.image || failedToLoad) {
    return (
      <>
        <span className="memory-film-lines" aria-hidden="true" />
        <p>
          A MEMORY
          <br />
          COMING SOON
        </p>
      </>
    );
  }

  return (
    <img
      src={memory.image}
      alt={memory.alt ?? memory.label}
      // The rail is transformed/pinned while it scrolls. Eagerly loading these
      // small, local JPEGs avoids mobile browsers deferring them indefinitely.
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => setFailedToLoad(true)}
    />
  );
}

export default function MemoryTimeline() {
  const rail = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const element = rail.current;
    const container = section.current;
    const sticky = pin.current;
    if (!element || !container || !sticky) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const travel = Math.max(0, element.scrollWidth - element.clientWidth);
      // The document's vertical position is the only playhead. No wheel capture,
      // accumulated deltas or easing that can lose sync during fast scrolling.
      const position = Math.max(
        0,
        Math.min(travel, -container.getBoundingClientRect().top)
      );
      element.scrollLeft = position;
      const start = position < 2;
      const end = position >= travel - 2;
      setEdges(previous =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end }
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      const travel = Math.max(0, element.scrollWidth - element.clientWidth);
      container.style.height = `${sticky.offsetHeight + travel}px`;
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(sticky);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, []);

  function navigate(direction: number) {
    const element = rail.current;
    if (!element || !section.current) return;
    const item = element.querySelector<HTMLElement>(".memory-stop");
    const distance = item ? item.offsetWidth + 110 : element.clientWidth * 0.8;
    const travel = element.scrollWidth - element.clientWidth;
    const next = Math.max(
      0,
      Math.min(travel, element.scrollLeft + direction * distance)
    );
    window.scrollTo({
      top: window.scrollY + section.current.getBoundingClientRect().top + next,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <section
      ref={section}
      className="memory-timeline memory-timeline--unified"
      aria-labelledby="timeline-title"
    >
      <div ref={pin} className="timeline-pin">
        <div className="section-kicker">LAST YEAR, IN PIECES</div>
        <div className="timeline-heading">
          <h2 id="timeline-title">
            A FEW MOMENTS
            <br />
            <em>WE KEPT.</em>
          </h2>
          <div className="timeline-aside">
            <p>
              Eleven little windows into our year.
              <br />
              The moments are still with us.
            </p>
            <div
              className="timeline-controls"
              aria-label="Photo timeline controls"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={edges.start}
                aria-controls="memory-rail"
              >
                PREVIOUS
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                disabled={edges.end}
                aria-controls="memory-rail"
              >
                NEXT MEMORIES
              </button>
            </div>
          </div>
        </div>
        <p className="timeline-hint" id="timeline-hint">
          KEEP SCROLLING DOWN TO FOLLOW THE THREAD
        </p>
        <div
          id="memory-rail"
          ref={rail}
          className="memory-rail"
          tabIndex={0}
          role="region"
          aria-label="Last year's photo timeline"
          aria-describedby="timeline-hint"
          onKeyDown={event => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              navigate(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <ol className="memory-track">
            {memories.map((memory, index) => (
              <li className="memory-stop" key={memory.label}>
                <GlowCard
                  className="memory-card"
                  glowColor={index % 2 ? "green" : "purple"}
                >
                  <div className="memory-card__image">
                    <MemoryImage memory={memory} />
                  </div>
                  <div className="memory-card__copy">
                    <h3>{memory.label}</h3>
                    <p>{memory.copy}</p>
                  </div>
                </GlowCard>
                {index < memories.length - 1 && (
                  <svg
                    className={`memory-branch ${index % 2 ? "memory-branch--up" : ""}`}
                    viewBox="0 0 110 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M 0 0 C 45 0 12 70 56 70 C 100 70 99 14 64 22 C 30 30 45 110 110 120" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
