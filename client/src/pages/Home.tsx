import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Disc3,
  MoveUpRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import ScrollDisco from "@/components/ScrollDisco";
import { EVENT } from "@shared/event";

const chapters = [
  "The invitation",
  "The place",
  ...EVENT.schedule.map(act => act.label),
  "The lineup",
  "You're invited",
];
const chapterIds = [
  "top",
  "venue",
  ...EVENT.schedule.map((_, i) => `act-${i + 1}`),
  "lineup",
  "your-invitation",
];
const shortNames = [
  "COME THROUGH",
  "THE PLACE",
  "SAY HELLO",
  "THE SPOTLIGHT",
  "BASS UP",
  "REFUEL",
  "ONE MORE",
  "THE LINEUP",
  "YOUR TURN",
];

export default function Home() {
  const reduced = useReducedMotion();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const active = Math.max(
    0,
    Math.min(chapters.length - 1, Math.round(position))
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      setPosition(
        max > 0
          ? Math.max(0, Math.min(1, scrollY / max)) * (chapters.length - 1)
          : 0
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  function go(index: number) {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({
      top: (index / (chapters.length - 1)) * max,
      behavior: reduced ? "instant" : "smooth",
    });
  }
  async function toggleSound() {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      try {
        audio.current.volume = 0.3;
        await audio.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }
  function sceneStyle(index: number): CSSProperties {
    const distance = position - index;
    const opacity = reduced
      ? active === index
        ? 1
        : 0
      : Math.max(0, Math.min(1, (0.5 - Math.abs(distance)) / 0.13));
    return {
      opacity,
      visibility: opacity === 0 ? "hidden" : "visible",
      pointerEvents: active === index ? "auto" : "none",
      "--scene-drift": `${reduced ? 0 : -distance * 28}px`,
    } as CSSProperties;
  }

  return (
    <div className="night-site">
      <a className="night-skip" href="/pass">
        Skip animation and get your pass
      </a>
      <ScrollDisco />
      <div className="night-atmosphere" aria-hidden="true" />
      <audio
        ref={audio}
        src="/audio/tame-impala-loser.mp3"
        loop
        preload="none"
        onError={() => setPlaying(false)}
      />
      <header className="night-nav">
        <button
          className="night-brand"
          onClick={() => go(0)}
          aria-label="CSB Disco Club home"
        >
          <Disc3 strokeWidth={1.25} />
          <span>
            CSB<span>DISCO CLUB</span>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button onClick={() => go(1)}>THE PLACE</button>
          <button onClick={() => go(7)}>THE LINEUP</button>
          <a className="night-nav-pass" href="/pass">
            GET A PASS <ArrowUpRight size={14} />
          </a>
        </nav>
        <button
          className="night-sound"
          onClick={toggleSound}
          aria-pressed={playing}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          {playing ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>SOUND {playing ? "ON" : "OFF"}</span>
        </button>
      </header>

      <main className="night-film" aria-label="CSB Freshers scroll experience">
        <section
          className="night-scene night-opening"
          style={sceneStyle(0)}
          aria-hidden={active !== 0}
          aria-label="The invitation"
        >
          <div className="night-edge night-edge-left night-hero-type">
            <p className="night-overline">MGIT PRESENTS / FRESHERS ’26</p>
            <h1>
              DISCO
              <br /> <span>CLUB</span>
              <i aria-hidden="true">✳</i>
            </h1>
            <p className="night-hero-note">
              New faces.
              <br /> Same frequency.
            </p>
          </div>
          <div className="night-edge night-edge-right night-hero-invite">
            <span className="night-invite-label">YOUR FIRST OF MANY.</span>
            <div className="night-date">
              16
              <span>
                OCT
                <br /> 2026
              </span>
            </div>
            <p className="night-place">
              {EVENT.venue} <span>/ MGIT</span>
            </p>
            <p className="night-hours">10:00 AM — 4:00 PM</p>
            <a className="night-cta" href="/pass">
              I’M COMING <ArrowUpRight size={21} />
            </a>
            <p className="night-small">FOR THE CSB CLASSES OF ’25 + ’26</p>
          </div>
          <button className="night-hero-scroll" onClick={() => go(1)}>
            <ArrowDown size={15} />
            <span>SCROLL. LET IT UNFOLD.</span>
          </button>
          <span className="night-stamp" aria-hidden="true">
            GOOD PEOPLE
            <br /> GREAT FREQUENCIES
            <br /> <b>✳</b>
          </span>
        </section>

        <section
          className="night-scene night-place-scene"
          style={sceneStyle(1)}
          aria-hidden={active !== 1}
          aria-label="The place"
        >
          <div className="night-edge night-edge-left night-primary">
            <p className="night-overline">01 / FIND YOUR PEOPLE</p>
            <h2>
              LEAVE
              <br /> THE SHY
              <br />{" "}
              <em>
                AT THE
                <br /> DOOR.
              </em>
            </h2>
          </div>
          <div className="night-edge night-edge-right night-secondary">
            <span className="night-location">
              {EVENT.venue}
              <MoveUpRight />
            </span>
            <p className="night-copy">
              One room. Two batches.
              <br /> A whole new circle.
            </p>
            <p className="night-detail">
              Meet us at MGIT on {EVENT.date}. Six hours of music, performances,
              food, and your kind of people.
            </p>
            <button className="night-text-link" onClick={() => go(2)}>
              MEET THE FIVE ACTS <ArrowDown size={15} />
            </button>
          </div>
        </section>

        {EVENT.schedule.map((act, index) => (
          <section
            key={act.title}
            className={`night-scene night-act ${index % 2 ? "night-act-flip" : ""}`}
            style={
              {
                ...sceneStyle(index + 2),
                "--act-color": act.color,
              } as CSSProperties
            }
            aria-hidden={active !== index + 2}
            aria-label={`Act ${index + 1}: ${act.title}`}
          >
            <div className="night-edge night-edge-left night-primary">
              <p className="night-overline">
                ACT 0{index + 1} / {act.label.toUpperCase()}
              </p>
              <h2>
                {act.headline[0]}
                <br /> <em>{act.headline[1]}</em>
              </h2>
              <span className="night-act-number" aria-hidden="true">
                0{index + 1}
              </span>
            </div>
            <div className="night-edge night-edge-right night-secondary">
              <span className="night-act-time">{act.time}</span>
              <h3>{act.title}</h3>
              <span className="night-translation">{act.translation}</span>
              <p className="night-detail">{act.detail}</p>
              <button className="night-text-link" onClick={() => go(index + 3)}>
                {index === 4 ? "SEE THE LINEUP" : "KEEP THE GOOD GOING"}
                <ArrowDown size={15} />
              </button>
            </div>
          </section>
        ))}

        <section
          className="night-scene night-lineup"
          style={sceneStyle(7)}
          aria-hidden={active !== 7}
          aria-label="The full lineup"
        >
          <div className="night-edge night-edge-left night-primary">
            <p className="night-overline">THE RUN OF SHOW</p>
            <h2>
              SIX
              <br /> HOURS.
              <br /> <em>ALL OUT.</em>
            </h2>
            <p className="night-detail">
              16 October / {EVENT.venue}
              <br /> 10:00 AM — 4:00 PM
            </p>
            <span className="night-provisional">
              PROVISIONAL · FINAL TIMES COMING SOON
            </span>
          </div>
          <div className="night-edge night-edge-right night-secondary night-running-order">
            {EVENT.schedule.map((act, index) => (
              <button key={act.title} onClick={() => go(index + 2)}>
                <span>{act.time}</span>
                <strong>{act.title}</strong>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section
          className="night-scene night-finale"
          style={sceneStyle(8)}
          aria-hidden={active !== 8}
          aria-label="Get your invitation"
        >
          <div className="night-edge night-edge-left night-primary">
            <p className="night-overline">EVERY PIECE BELONGS.</p>
            <h2>
              THIS
              <br /> ONE’S
              <br /> <em>YOURS.</em>
            </h2>
          </div>
          <div className="night-edge night-edge-right night-secondary">
            <span className="night-finale-star" aria-hidden="true">
              ✳
            </span>
            <h3>
              Your name.
              <br /> Your pass.
              <br /> Your people.
            </h3>
            <p className="night-detail">
              Bring your energy. We’ll bring the disco.
              <br /> Make your personal pass and meet us on the floor.
            </p>
            <a className="night-cta" href="/pass">
              MAKE IT OFFICIAL <ArrowUpRight size={21} />
            </a>
            <button className="night-text-link" onClick={() => go(0)}>
              ONE MORE SPIN ↑
            </button>
          </div>
        </section>
      </main>

      <div className="night-scroll-track" aria-hidden="true">
        {chapterIds.map(id => (
          <div id={id} key={id} className="night-scroll-stop" />
        ))}
      </div>
      <footer className="night-deck">
        <span className="night-deck-brand">CSB / 2026</span>
        <nav className="night-chapter-nav" aria-label="Scroll chapters">
          {chapters.map((name, index) => (
            <button
              key={name}
              onClick={() => go(index)}
              aria-label={`Go to ${name}`}
              aria-current={active === index ? "step" : undefined}
            >
              <span />
            </button>
          ))}
        </nav>
        <span className="night-deck-label">
          {String(active + 1).padStart(2, "0")} / {shortNames[active]}
        </span>
      </footer>
    </div>
  );
}
