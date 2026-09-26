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

const eventFacts = [
  { icon: CalendarDaysIcon, label: "Friday · 17 October 2026", value: "10:00 AM — 4:00 PM" },
  { icon: MapPin, label: "The Grand Atrium", value: "CSB Block · Main Campus" },
  { icon: Users, label: "CSB · Juniors & Seniors", value: "One celebration. All of us." },
];

const runningLine = ["CSB / FRESHERS 26", "MAKE SOME NOISE", "WELCOME TO THE NEXT CHAPTER", "CSB / FRESHERS 26"];

function CalendarDaysIcon(props: React.ComponentProps<typeof Clock3>) {
  return <Clock3 {...props} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
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
      void audio.play().then(() => setMusicPlaying(true)).catch(() => toast.error("Tap once more to let the browser start the music."));
      return;
    }

    audio.pause();
    setMusicPlaying(false);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateForm("photoUrl", file.name);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register.mutate(form, {
      onSuccess: () => {
        setSubmitted(true);
        setForm({ name: "", rollNo: "", email: "", photoUrl: "" });
        toast.success("You’re on the list — see you at the celebration.");
      },
      onError: (error: { message?: string }) => toast.error(error.message || "Could not save your registration. Try again."),
    });
  };

  return (
    <div ref={shellRef} className="site-shell">
      <div className="pointer-glow" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <audio ref={audioRef} src="/audio/tame-impala-loser.mp3" loop preload="auto" playsInline />

      <header className="site-nav">
        <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="Back to top">
          <span className="brand-mark">CSB</span>
          <span className="brand-copy">Freshers <b>26</b></span>
        </button>
        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <button onClick={() => scrollTo("about")}>The gathering</button>
          <button onClick={() => scrollTo("lineup")}>Line-up</button>
          <button onClick={() => scrollTo("register")}>Register</button>
        </nav>
        <button className="nav-cta" onClick={() => scrollTo("register")}>
          <span>Get your pass</span><ArrowUpRight size={15} />
        </button>
        <div className="nav-actions">
          <button className={`nav-music-toggle ${musicPlaying ? "is-playing" : ""}`} onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"}>
            <Music2 size={18} />
            <span>{musicPlaying ? "On" : "Play"}</span>
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <button className={`music-toggle ${musicPlaying ? "is-playing" : ""}`} onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"}>
        <Music2 size={16} />
        <span>{musicPlaying ? "Sound on" : "Play song"}</span>
      </button>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <motion.div className="hero-orb" aria-hidden="true" animate={{ opacity: [0.88, 1, 0.88] }} transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}>
            <div className="orb-core"><span>CSB</span></div>
            <div className="orb-ring ring-a" />
            <div className="orb-ring ring-b" />
            <span className="orb-caption">FRESHERS<br />DAY</span>
          </motion.div>
          <motion.div className="hero-copy" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}>
            <div className="eyebrow"><span className="status-dot" /> CSB · Computer Science &amp; Business Systems</div>
            <h1>
              Meet the<br /><em>next</em> <span className="outlined-word">chapter</span>
            </h1>
            <p className="hero-intro">A new class. A new rhythm.<br />One unforgettable day together.</p>
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
            <span>17 OCTOBER 2026</span><span>THE GRAND ATRIUM</span><span>10 AM — 4 PM</span>
          </div>
        </section>

        <div className="marquee" aria-label="CSB Freshers 26">
          <div className="marquee-track">{[...runningLine, ...runningLine].map((item, index) => <span key={`${item}-${index}`}>{item}<b>✳</b></span>)}</div>
        </div>

        <section id="about" className="about-section section-pad">
          <div className="section-head">
            <SectionLabel>The gathering</SectionLabel>
            <p className="section-kicker">Not an orientation.<br /><strong>A proper welcome.</strong></p>
          </div>
          <div className="about-layout">
            <Reveal className="about-statement">
              <p>We’ve been in the same classrooms, same corridors, same group chats.</p>
              <p className="statement-large">Now let’s make a memory that feels <em>nothing</em> like a timetable.</p>
              <span className="hand-note">bring your people <span>↗</span></span>
            </Reveal>
            <Reveal className="about-detail">
              <p>Fresh faces, familiar energy. A day of performances, stories, a shared dance floor, and the first page of everything that comes next.</p>
              <div className="detail-rule" />
              <p className="detail-small">Dress code: come as the version of you that is ready to celebrate.</p>
            </Reveal>
          </div>
          <div className="facts-grid">
            {eventFacts.map((fact) => {
              const Icon = fact.icon;
              return <Reveal key={fact.label} className="fact-card" >
                <Icon size={20} strokeWidth={1.5} />
                <div><strong>{fact.label}</strong><span>{fact.value}</span></div>
              </Reveal>;
            })}
          </div>
        </section>

        <section id="lineup" className="lineup-section section-pad">
          <div className="section-head">
            <SectionLabel>The schedule</SectionLabel>
            <p className="section-kicker">A little bit of<br /><strong>everything.</strong></p>
          </div>
          <Reveal className="lineup-intro">
            <h2>Plug in.<br /><span>Open up.</span></h2>
            <p>A full day built to bring juniors and seniors together. Arrive curious, leave with stories worth keeping.</p>
          </Reveal>
          <div className="lineup-list">
            {[
              ["01", "Le Grand Accueil", "10:00 — 10:45 AM", "A warm welcome for our guests, juniors, and seniors."],
              ["02", "The Spotlight Assembly", "10:45 AM — 12:00 PM", "Performances by juniors and seniors, sharing one stage."],
              ["03", "Common Pulse", "12:00 — 1:00 PM", "The floor opens and both batches move together."],
              ["04", "Convivium Magnum", "1:00 — 2:00 PM", "The grand feast: good food, long tables, and louder conversations."],
              ["05", "Ludi Romani", "2:00 — 4:00 PM", "Post-lunch games, surprises, and one last burst of collective chaos."],
            ].map(([number, title, time, description], index) => <motion.div key={number} className="lineup-row reveal" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ x: 8, backgroundColor: "rgba(237,242,237,.055)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}>
              <span className="row-number">{number}</span><div className="row-title"><h3>{title}</h3><p>{description}</p></div><div className="row-time"><Clock3 size={15} />{time}</div><ArrowUpRight className="row-arrow" size={22} />
            </motion.div>)}
          </div>
        </section>

        <section className="manifesto-section">
          <div className="manifesto-scan" aria-hidden="true" />
          <Reveal className="manifesto-content">
            <span className="manifesto-overline"><Sparkles size={14} /> For the curious ones</span>
            <h2>Start<br /><em>somewhere.</em></h2>
            <p>The people you meet here might become the stories you tell long after the syllabus ends.</p>
            <button className="circle-button" onClick={() => scrollTo("register")} aria-label="Register now"><ArrowDown size={20} /></button>
          </Reveal>
          <div className="manifesto-orb" aria-hidden="true"><div className="manifesto-orb-inner">CSB<br /><span>TOGETHER</span></div></div>
        </section>

        <section id="register" className="register-section section-pad">
          <div className="section-head">
            <SectionLabel>Your entry</SectionLabel>
            <p className="section-kicker">Make it<br /><strong>official.</strong></p>
          </div>
          <div className="register-layout">
            <Reveal className="register-copy">
              <h2>Save<br /><em>your seat.</em></h2>
              <p>Drop your details below and upload a photo from your device. The form is ready for the Google Drive handoff once the Drive connection is added.</p>
              <div className="form-note"><ShieldCheck size={16} /><span>Your details are only for the CSB Freshers guest list.</span></div>
              <div className="register-stamp"><Ticket size={17} /><span>CSB<br /><b>FRESHERS 26</b></span></div>
            </Reveal>
            <Reveal className="register-form-card">
              {submitted ? <div className="success-state"><div className="success-icon"><Check size={27} /></div><span className="eyebrow">Registration confirmed</span><h3>You’re on the list.</h3><p>Keep an eye on your inbox for the final details. Until then — tell your crew.</p><button className="secondary-button" onClick={() => setSubmitted(false)}>Register another person <ArrowUpRight size={15} /></button></div> : <form onSubmit={handleSubmit}>
                <div className="form-topline"><span>Guest details</span><span>Complete your pass</span></div>
                <label><span>Full name</span><input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Your name" /></label>
                <div className="form-split"><label><span>Roll number</span><input required value={form.rollNo} onChange={(event) => updateForm("rollNo", event.target.value)} placeholder="CSB26..." /></label><label><span>Email</span><input required type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="you@email.com" /></label></div>
                <div className="photo-upload-field">
                  <span>Photo</span>
                  <input ref={photoInputRef} className="sr-only" required type="file" accept="image/*" onChange={handlePhotoSelect} />
                  <button type="button" className="upload-button" onClick={() => photoInputRef.current?.click()}>
                    <Camera size={16} />
                    <span>{form.photoUrl || "Upload photo"}</span>
                  </button>
                </div>
                <p className="input-hint"><Camera size={14} /> Choose an image now; Drive delivery can be connected on the backend next.</p>
                <button disabled={register.isPending} className="submit-button" type="submit"><span>{register.isPending ? "Saving your spot..." : "Add me to the list"}</span><ArrowUpRight size={17} /></button>
              </form>}
            </Reveal>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-topline"><span>CSB / FRESHERS 26</span><span>THE FIRST OF MANY</span></div>
          <Reveal><h2>See you<br /><em>there.</em></h2></Reveal>
          <div className="closing-bottomline"><span>Computer Science &amp; Business Systems</span><a href="https://instagram.com" target="_blank" rel="noreferrer">Follow the energy <Instagram size={15} /></a></div>
        </section>
      </main>
      <footer className="site-footer"><span>Made for the next chapter.</span><span>CSB / 2026</span><span><Music2 size={13} /> Sound on in spirit</span></footer>
    </div>
  );
}
