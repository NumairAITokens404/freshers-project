import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Check, Download, Loader2, Upload } from "lucide-react";
import PartyPopper from "@/components/PartyPopper";
import { GlowCard } from "@/components/ui/spotlight-card";
import { blobToDataUrl, createPassPdf, downloadPassPdf } from "@/lib/pass";
import { EVENT } from "@shared/event";
import { identitySchema, type Guest } from "@shared/registration";

type IssuedPass = { guest: Guest; photo: string; id: number };
const emptyGuest: Guest = { name: "", rollNo: "", email: "" };

export default function NightPass() {
  const id = useId();
  const mounted = useRef(true);
  const photoVersion = useRef(0);
  const submitting = useRef(false);
  const [guest, setGuest] = useState<Guest>(emptyGuest);
  const [photo, setPhoto] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [pass, setPass] = useState<IssuedPass | null>(null);
  const [passPdf, setPassPdf] = useState<Blob | null>(null);
  const [exporting, setExporting] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      photoVersion.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!pass) {
      setPassPdf(null);
      return;
    }
    let cancelled = false;
    setPassPdf(null);
    void createPassPdf(pass.guest, pass.photo, pass.id)
      .then(pdf => {
        if (!cancelled) setPassPdf(pdf);
      })
      .catch(cause => {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Couldn't prepare your pass. Please try again."
          );
      });
    return () => {
      cancelled = true;
    };
  }, [pass]);

  async function choosePhoto(file?: File) {
    if (!file) return;
    const version = ++photoVersion.current;
    setPhoto("");
    setPhotoBusy(true);
    setError("");
    try {
      if (!file.type.startsWith("image/"))
        throw new Error("Pick an image file for your pass photo.");
      if (file.size > 8 * 1024 * 1024)
        throw new Error("Keep your photo under 8 MB.");
      const url = URL.createObjectURL(file);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 640 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Couldn't read this photo. Try another.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        if (mounted.current && version === photoVersion.current)
          setPhoto(canvas.toDataURL("image/jpeg", 0.74));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (cause) {
      if (mounted.current && version === photoVersion.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Couldn't read this photo. Try another."
        );
    } finally {
      if (mounted.current && version === photoVersion.current)
        setPhotoBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const parsed = identitySchema.safeParse(guest);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (photoBusy || !photo) {
      setError("Choose a photo for your pass before joining the guest list.");
      return;
    }
    submitting.current = true;
    const passPhoto = photo;
    try {
      setRegistering(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, photo }),
      });
      const result = await response.json() as { id?: number; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "Registration failed");
      if (mounted.current)
        setPass({ guest: parsed.data, photo: passPhoto, id: result.id });
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Couldn't save your spot. Please try again."
        );
    } finally {
      if (mounted.current) setRegistering(false);
      submitting.current = false;
    }
  }

  async function savePass() {
    if (!pass || !passPdf || exporting) return;
    downloadPassPdf(passPdf, pass.guest.rollNo);
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pass.guest.name, rollNo: pass.guest.rollNo, pdf: await blobToDataUrl(passPdf) }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Pass backup failed");
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Couldn't download your pass. Please try again."
        );
    } finally {
      if (mounted.current) setExporting(false);
    }
  }

  function reset() {
    photoVersion.current += 1;
    setPass(null);
    setPassPdf(null);
    setGuest(emptyGuest);
    setPhoto("");
    setPhotoBusy(false);
    setError("");
  }

  return (
    <GlowCard className="np-shell">
      {pass && <PartyPopper key={pass.id} />}
      <header className="np-heading">
        <span className="np-kicker">YOUR ALL-ACCESS PASS</span>
        <h1 className="np-title">
          {pass ? (
            <>
              YOU’RE IN.
              <br />
              <em>LET’S DANCE.</em>
            </>
          ) : (
            <>
              YOUR NAME.
              <br />
              <em>ON THE LIST.</em>
            </>
          )}
        </h1>
        {!pass && (
          <p className="np-intro">
            For MGIT CSB, batches ’25 & ’26. Your people are waiting.
          </p>
        )}
      </header>

      {pass ? (
        <div className="np-success" aria-live="polite">
          <div className="np-confirmed">
            <Check size={15} /> YOU’RE ON THE LIST
          </div>
          <GlowCard
            className="np-ticket"
            glowColor="green"
            role="region"
            aria-label="Your confirmed event pass"
          >
            <div className="np-ticket-top">
              <span className="jashn-ticket-wordmark">{EVENT.title}</span>
              <span>#{String(pass.id).padStart(5, "0")}</span>
            </div>
            <img
              className="np-ticket-photo"
              src={pass.photo}
              alt={`${pass.guest.name}'s pass photo`}
            />
            <div className="np-ticket-guest">
              <small>ALL ACCESS / THE GUEST</small>
              <h3>{pass.guest.name}</h3>
              <p>{pass.guest.rollNo}</p>
              <p>{pass.guest.email}</p>
            </div>
            <div className="np-ticket-stub">
              <strong>
                {EVENT.date} · {EVENT.venue}
              </strong>
              <span>{EVENT.time}</span>
            </div>
          </GlowCard>
          <p className="np-save-note">
            Download your pass before leaving. Your photo and pass are backed up
            privately for the JASHN organisers.
          </p>
          <button
            className="np-submit"
            type="button"
            onClick={() => void savePass()}
            disabled={!passPdf || exporting}
          >
            {!passPdf
              ? "PREPARING YOUR PASS…"
              : exporting
                ? "SAVING YOUR PASS…"
                : "DOWNLOAD MY PASS"}
            {!passPdf || exporting ? (
              <Loader2 className="np-loading" size={18} />
            ) : (
              <Download size={18} />
            )}
          </button>
          <button
            className="np-reset"
            type="button"
            onClick={reset}
            disabled={exporting}
          >
            Register another student
          </button>
        </div>
      ) : (
        <form
          className="np-form"
          onSubmit={submit}
          noValidate
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <fieldset className="np-fields" disabled={registering}>
            <div className="np-field">
              <label className="np-label" htmlFor={`${id}-name`}>
                FULL NAME
              </label>
              <input
                className="np-input"
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                placeholder="The name we’ll cheer for"
                maxLength={180}
                value={guest.name}
                onChange={event =>
                  setGuest(previous => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="np-field">
              <label className="np-label" htmlFor={`${id}-roll`}>
                ROLL NUMBER
              </label>
              <input
                className="np-input"
                id={`${id}-roll`}
                name="rollNo"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="25261A32… or 26261A32…"
                maxLength={80}
                value={guest.rollNo}
                onChange={event =>
                  setGuest(previous => ({
                    ...previous,
                    rollNo: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="np-field">
              <label className="np-label" htmlFor={`${id}-email`}>
                COLLEGE EMAIL
              </label>
              <input
                className="np-input"
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yournamecsb2532…@mgit.ac.in"
                maxLength={320}
                value={guest.email}
                onChange={event =>
                  setGuest(previous => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                aria-describedby={`${id}-email-hint`}
                required
              />
              <p className="np-hint" id={`${id}-email-hint`}>
                Use your csb2532… or csb2632… MGIT email.
              </p>
            </div>
            <div className="np-field">
              <span className="np-label">YOUR PASS PHOTO</span>
              <GlowCard className="np-photo-glow">
                <label className="np-photo-picker" htmlFor={`${id}-photo`}>
                  {photo ? (
                    <img
                      className="np-photo-preview"
                      src={photo}
                      alt="Selected pass photo"
                    />
                  ) : (
                    <Upload size={22} aria-hidden="true" />
                  )}
                  <span className="np-photo-copy">
                    <strong>
                      {photoBusy
                        ? "Getting your photo ready…"
                        : photo
                          ? "Photo ready. Looking good."
                          : "Add your photo"}
                    </strong>
                    <span>
                      {photo
                        ? "Choose a different photo"
                        : "JPG, PNG or WebP · max 8 MB"}
                    </span>
                  </span>
                  <input
                    className="np-photo-input"
                    id={`${id}-photo`}
                    type="file"
                    accept="image/*"
                    aria-label="Choose your pass photo"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      void choosePhoto(file);
                    }}
                  />
                </label>
              </GlowCard>
              <span className="np-photo-status" role="status">
                {photoBusy ? "Processing photo on this device." : ""}
              </span>
            </div>
            <button
              className="np-submit"
              type="submit"
              disabled={registering || photoBusy}
            >
              {registering
                ? "SAVING YOUR SPOT…"
                : "REGISTER & GET MY PASS"}
              {registering && (
                <Loader2 className="np-loading" size={18} />
              )}
            </button>
          </fieldset>
          <p className="np-privacy">
            Your name, roll number and email go to the event guest list. Your
            photo is stored privately for your pass and return-gift planning.
          </p>
        </form>
      )}
      {error && (
        <p className="np-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </GlowCard>
  );
}
