import { EVENT } from "@shared/event";
import { useRef, useState } from "react";
import { GlowCard } from "@/components/ui/spotlight-card";
import MemoryTimeline from "@/components/MemoryTimeline";
import DaySchedule from "@/components/DaySchedule";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="static-night">
      <audio
        ref={audioRef}
        src="/audio/tame-impala-loser.mp3"
        loop
        preload="metadata"
      />
      <div className="static-night__backdrop" aria-hidden="true" />
      <a className="static-skip" href="#main-content">
        Skip to the story
      </a>

      <header className="static-nav">
        <a
          className="static-brand"
          href="#top"
          aria-label={`${EVENT.title} home`}
        >
          <span>
            <span className="jashn-wordmark">{EVENT.title}</span>
            <b>CSB FRESHERS ’26</b>
          </span>
        </a>
        <div className="static-nav__aside">
          <span>
            {EVENT.date} · {EVENT.venue}
          </span>
          <a href="/pass">GET YOUR PASS</a>
          <button
            className="sound-toggle"
            type="button"
            onClick={toggleSound}
            aria-pressed={isPlaying}
          >
            {isPlaying ? "PAUSE SOUND" : "PLAY SOUND"}
          </button>
        </div>
      </header>

      <main id="main-content">
        <section className="static-hero" id="top">
          <div className="static-hero__copy">
            <p>NEW FACES. SAME FREQUENCY.</p>
            <h1 className="jashn-hero-wordmark">{EVENT.title}</h1>
            <p className="jashn-hero-tagline">This is where it starts.</p>
          </div>
          <GlowCard className="static-hero__details">
            <p className="static-hero__date">
              16{" "}
              <span>
                OCT
                <br />
                2026
              </span>
            </p>
            <p>
              {EVENT.time}
              <br />
              {EVENT.venue} / MGIT
            </p>
            <a className="acid-button" href="/pass">
              MAKE IT OFFICIAL
            </a>
          </GlowCard>
        </section>

        <section className="schedule-section">
          <div className="schedule-section__intro">
            <p className="section-kicker">
              {EVENT.date.toUpperCase()} / {EVENT.venue}
            </p>
            <h2>
              A LITTLE PLAN.
              <br />
              <em>A LOT OF FEELING.</em>
            </h2>
            <p>
              First hellos to the final song.
              <br />
              Leave a little room for the unexpected.
            </p>
          </div>
          <DaySchedule />
        </section>

        <section className="story-intro" id="memories">
          <div className="section-kicker">BEFORE YOU, THERE WAS US</div>
          <div className="story-intro__grid">
            <h2>
              EVERY BATCH
              <br />
              LEAVES A LITTLE
              <br />
              <em>LIGHT BEHIND.</em>
            </h2>
            <div className="story-intro__note">
              <p>
                Last year began with strangers in one room. It ended with inside
                jokes, blurry photos, and people we couldn’t imagine college
                without.
              </p>
              <span>YOURS STARTS HERE.</span>
            </div>
          </div>
        </section>

        <MemoryTimeline />

        <section className="final-memory" aria-labelledby="final-title">
          <div className="section-kicker">ONE YEAR LATER</div>
          <GlowCard className="final-memory__frame">
            <img
              src="/images/freshers/freshers-2025.jpeg"
              alt="The freshers batch gathered together after last year's celebration"
              width={1600}
              height={763}
              loading="lazy"
            />
            <div className="final-memory__copy">
              <p>THE PHOTO AT THE END OF THE NIGHT</p>
              <h2 id="final-title">
                WE CAME IN AS A CROWD. <em>WE LEFT AS US.</em>
              </h2>
            </div>
          </GlowCard>
          <div className="final-memory__after">
            <p>
              Someday, this will be an old photo too.
              <br />
              So show up. Say hello. Stay for the last song.
            </p>
            <a className="acid-button" href="/pass">
              BE IN THIS YEAR’S PHOTO
            </a>
          </div>
        </section>
      </main>

      <footer className="static-footer">
        <span>{EVENT.title} / CSB ’26</span>
        <p>YOUR FIRST OF MANY.</p>
        <a href="#top">BACK TO THE LIGHT</a>
      </footer>
    </div>
  );
}
