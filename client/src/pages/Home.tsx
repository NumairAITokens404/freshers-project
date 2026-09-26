import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  Check,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  Music2,
  Orbit,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const partyAudioUrl = "/audio/tame-impala-loser.mp3";

const eventFacts = [
  { icon: CalendarDaysIcon, label: "Friday · 17 October", value: "Doors at 5:30 PM" },
  { icon: MapPin, label: "The Grand Atrium", value: "CSB Block · Main Campus" },
  { icon: Users, label: "CSB · Freshers cohort", value: "One night. All of us." },
];

const runningLine = ["CSB / FRESHERS", "LIGHTS DOWN", "DANCE FLOOR OPEN", "CSB / FRESHERS"];

function CalendarDaysIcon(props: React.ComponentProps<typeof Clock3>) {
  return <Clock3 {...props} />;
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-label__number">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`reveal ${className}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.72, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const shellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", rollNo: "", email: "", photoUrl: "" });
  const register = trpc.registrations.create.useMutation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: true,
    });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const root = shellRef.current;
      if (!root) return;
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const startMusic = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = 0.34;
      void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    };
    window.addEventListener("pointerdown", startMusic, { once: true });
    window.addEventListener("keydown", startMusic, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.34;
    if (audio.paused) {
      void audio.play().then(() => setMusicPlaying(true)).catch(() => toast.error("Tap once more to start the music."));
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    toast.success(`${file.name} selected — add its Google Drive link before submitting.`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register.mutate(form, {
      onSuccess: () => {
        setSubmitted(true);
        setForm({ name: "", rollNo: "", email: "", photoUrl: "" });
        toast.success("You’re on the list — see you under the lights.");
      },
      onError: (error: { message?: string }) => toast.error(error.message || "Could not save your registration. Try again."),
    });
  };

  return (
      <div ref={shellRef} className="site-shell">
        <div className="pointer-glow" aria-hidden="true" />
      <div className="disco-lightfield" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <audio ref={audioRef} src={partyAudioUrl} loop preload="auto" playsInline />

      <header className="site-nav">
        <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="Back to top">
          <span className="brand-mark">CSB</span>
          <span className="brand-copy">Freshers</span>
        </button>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <button onClick={() => scrollTo("about")} >The vibe</button>
          <button onClick={() => scrollTo("lineup")} >The set</button>
          <button onClick={() => scrollTo("register")} >Guest list</button>
        </nav>
        <button className="nav-cta" onClick={() => scrollTo("register")}>
          <span>Get your pass</span><ArrowUpRight size={15} />
        </button>
        <div className="nav-actions">
          <button className={`nav-music-toggle ${musicPlaying ? "is-playing" : ""}`} onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"}>
            <Music2 size={18} /><span>{musicPlaying ? "On" : "Play"}</span>
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <button className={`music-toggle ${musicPlaying ? "is-playing" : ""}`} onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"}>
        <Music2 size={16} /><span>{musicPlaying ? "Sound on" : "Play song"}</span>
      </button>

      <main id="top">
        <section className="hero-section">
        <div className="hero-grid" aria-hidden="true" />
        <div className="party-ceiling" aria-hidden="true">
          <span className="hanging-decor decor-ball decor-ball-one" />
          <span className="hanging-decor decor-ball decor-ball-two" />
          <span className="hanging-decor decor-ball decor-ball-three" />
          <span className="hanging-decor decor-disc decor-disc-one" />
          <span className="hanging-decor decor-disc decor-disc-two" />
          <span className="hanging-decor decor-star decor-star-one">✦</span>
          <span className="hanging-decor decor-star decor-star-two">✦</span>
          <span className="hanging-decor decor-star decor-star-three">✦</span>
        </div>
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <motion.div className="hero-orb" aria-hidden="true" animate={{ opacity: [0.88, 1, 0.88] }} transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}>
            <span className="orb-cord" />
            <div className="orb-core" aria-label="Mirror ball" />
            <div className="orb-ring ring-a" />
            <div className="orb-ring ring-b" />
            <span className="orb-caption">CSB<br />AFTER DARK</span>
          </motion.div>
          <motion.div className="hero-copy" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}>
            <div className="eyebrow"><span className="status-dot" /> CSB · Computer Science &amp; Business Systems · After Dark</div>
            <h1>
              Meet me<br /><em>under</em> <span className="outlined-word">the lights</span>
            </h1>
            <p className="hero-intro">Lights down. Volume up.<br />One unforgettable night together.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollTo("register")}>
                <span>Reserve your spot</span><ArrowUpRight size={17} />
              </button>
              <button className="ghost-button" onClick={() => scrollTo("about")}>
                <span className="play-dot"><ArrowDown size={14} /></span> Scroll to explore
              </button>
            </div>
          </motion.div>
          <div className="hero-side-note"><span>Scroll to feel it</span><div className="side-line" /></div>
          <div className="hero-bottomline">
            <span>17 / OCTOBER</span><span>THE GRAND ATRIUM</span><span>5:30 PM — LATE</span>
          </div>
        </section>

        <div className="marquee" aria-label="CSB Freshers">
          <div className="marquee-track">{[...runningLine, ...runningLine].map((item, index) => <span key={`${item}-${index}`}>{item}<b>✳</b></span>)}</div>
        </div>

        <section id="about" className="about-section section-pad">
          <div className="section-head">
            <SectionLabel number="01">The night</SectionLabel>
            <p className="section-kicker">No boring welcome.<br /><strong>Just the right kind of loud.</strong></p>
          </div>
          <div className="about-layout">
            <Reveal className="about-statement">
              <p>We’ve done the classrooms, corridors, and group chats.</p>
              <p className="statement-large">Now let’s make a memory that feels <em>everything</em> like a dance floor.</p>
              <span className="hand-note">bring your whole crew <span>↗</span></span>
            </Reveal>
            <Reveal className="about-detail">
              <div className="detail-number">∞</div>
              <p>Fresh faces, mirror-ball energy. An evening of music, neon, tiny dance floors, and the first beat of everything that comes next.</p>
              <div className="detail-rule" />
              <p className="detail-small">Dress code: chrome, colour, and the version of you that stays out a little later.</p>
            </Reveal>
          </div>
          <div className="facts-grid">
            {eventFacts.map((fact, index) => {
              const Icon = fact.icon;
              return <Reveal key={fact.label} className="fact-card" >
                <span className="fact-index">0{index + 1}</span><Icon size={20} strokeWidth={1.5} />
                <div><strong>{fact.label}</strong><span>{fact.value}</span></div>
              </Reveal>;
            })}
          </div>
        </section>

        <section id="lineup" className="lineup-section section-pad">
          <div className="section-head">
            <SectionLabel number="02">The frequency</SectionLabel>
            <p className="section-kicker">The night is<br /><strong>just getting started.</strong></p>
          </div>
          <Reveal className="lineup-intro">
            <h2>Lights down.<br /><span>Dance on.</span></h2>
            <p>Expect a night of lasers, loud hooks, mirror-ball moments, and the people you will remember.</p>
          </Reveal>
          <div className="lineup-list">
            {[
              ["01", "Mirror-ball warm-up", "5:30 — 6:30 PM", "Meet, mingle, find the glow."],
              ["02", "Neon frequency", "6:30 — 8:00 PM", "A live set built for the first big chorus."],
              ["03", "Open dance floor", "8:00 PM — late", "No agenda. Just good people and brighter lights."],
            ].map(([number, title, time, description], index) => <motion.div key={number} className="lineup-row reveal" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ x: 8, backgroundColor: "rgba(237,242,237,.055)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}>
              <span className="row-number">{number}</span><div className="row-title"><h3>{title}</h3><p>{description}</p></div><div className="row-time"><Clock3 size={15} />{time}</div><ArrowUpRight className="row-arrow" size={22} />
            </motion.div>)}
          </div>
        </section>

        <section className="manifesto-section">
          <div className="manifesto-scan" aria-hidden="true" />
          <Reveal className="manifesto-content">
            <span className="manifesto-overline"><Sparkles size={14} /> For the night owls</span>
            <h2>Find<br /><em>your rhythm.</em></h2>
            <p>The people you meet here might become the stories you tell long after the last song ends.</p>
            <button className="circle-button" onClick={() => scrollTo("register")} aria-label="Register now"><ArrowDown size={20} /></button>
          </Reveal>
          <div className="manifesto-orb" aria-hidden="true"><div className="manifesto-orb-inner">CSB<br /><span>DISCO</span></div></div>
        </section>

        <section id="register" className="register-section section-pad">
          <div className="section-head">
            <SectionLabel number="03">Your entry</SectionLabel>
            <p className="section-kicker">Bring your<br /><strong>best energy.</strong></p>
          </div>
          <div className="register-layout">
            <Reveal className="register-copy">
              <h2>Join<br /><em>the dance floor.</em></h2>
              <p>Drop your details below and keep your Google Drive photo link handy. We’re building the guest list for the freshest night on campus.</p>
              <div className="form-note"><ShieldCheck size={16} /><span>Your details are only for the CSB Freshers guest list.</span></div>
              <div className="register-stamp"><Ticket size={17} /><span>CSB<br /><b>FRESHERS</b></span></div>
            </Reveal>
            <Reveal className="register-form-card">
              {submitted ? <div className="success-state"><div className="success-icon"><Check size={27} /></div><span className="eyebrow">Registration confirmed</span><h3>You’re on the list.</h3><p>Keep an eye on your inbox for the final details. Until then — tell your crew.</p><button className="secondary-button" onClick={() => setSubmitted(false)}>Register another person <ArrowUpRight size={15} /></button></div> : <form onSubmit={handleSubmit}>
                <div className="form-topline"><span>Guest details</span><span>01 / 04</span></div>
                <label><span>Full name</span><input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Your name" /></label>
                <div className="form-split"><label><span>Roll number</span><input required value={form.rollNo} onChange={(event) => updateForm("rollNo", event.target.value)} placeholder="CSB26..." /></label><label><span>Email</span><input required type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="you@email.com" /></label></div>
                <label><span>Google Drive photo link</span><input required type="url" value={form.photoUrl} onChange={(event) => updateForm("photoUrl", event.target.value)} placeholder="https://drive.google.com/..." /></label>
                <div className="photo-upload-field">
                  <span>Or choose a photo first</span>
                  <input ref={photoInputRef} className="sr-only" type="file" accept="image/*" onChange={handlePhotoSelect} />
                  <button type="button" className="upload-button" onClick={() => photoInputRef.current?.click()}><Camera size={16} /><span>Choose image from device</span></button>
                </div>
                <p className="input-hint"><Camera size={14} /> Set your Drive photo to “Anyone with the link can view”.</p>
                <button disabled={register.isPending} className="submit-button" type="submit"><span>{register.isPending ? "Saving your spot..." : "Add me to the list"}</span><ArrowUpRight size={17} /></button>
              </form>}
            </Reveal>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-topline"><span>CSB / FRESHERS</span><span>THE FIRST OF MANY</span></div>
          <Reveal><h2>See you<br /><em>there.</em></h2></Reveal>
          <div className="closing-bottomline"><span>Computer Science &amp; Business Systems</span><a href="https://instagram.com" target="_blank" rel="noreferrer">Follow the energy <Instagram size={15} /></a></div>
        </section>
      </main>
      <footer className="site-footer"><span>Made for after dark.</span><span>CSB / AFTER DARK</span><span><Music2 size={13} /> Sound on in spirit</span></footer>
    </div>
  );
}
