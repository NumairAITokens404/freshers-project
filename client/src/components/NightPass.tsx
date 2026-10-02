import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Download, Loader2, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { downloadPass } from "@/lib/pass";
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
  const [exporting, setExporting] = useState(false);
  const register = trpc.registrations.create.useMutation();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      photoVersion.current += 1;
    };
  }, []);

  async function choosePhoto(file?: File) {
    if (!file) return;
    const version = ++photoVersion.current;
    setPhoto("");
    setPhotoBusy(true);
    setError("");
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error("Pick a JPG, PNG, or WebP photo.");
      if (file.size > 8 * 1024 * 1024)
        throw new Error("Keep your photo under 8 MB.");
      const url = URL.createObjectURL(file);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Couldn't read this photo. Try another.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        if (mounted.current && version === photoVersion.current)
          setPhoto(canvas.toDataURL("image/jpeg", 0.9));
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
      // Only identity details leave this device; the photo is used locally.
      const result = await register.mutateAsync(parsed.data);
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
      submitting.current = false;
    }
  }

  async function savePass() {
    if (!pass || exporting) return;
    setExporting(true);
    setError("");
    try {
      await downloadPass(pass.guest, pass.photo, pass.id);
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
    setGuest(emptyGuest);
    setPhoto("");
    setPhotoBusy(false);
    setError("");
    register.reset();
  }

  return (
    <div className="np-shell">
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
          <article className="np-ticket" aria-label="Your confirmed event pass">
            <div className="np-ticket-top">
              <span>CSB DISCO CLUB</span>
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
          </article>
          <p className="np-save-note">
            Download your pass before leaving. Your photo stays on this device
            and isn’t saved on our server.
          </p>
          <button
            className="np-submit"
            type="button"
            onClick={() => void savePass()}
            disabled={exporting}
          >
            {exporting ? "CREATING YOUR PASS…" : "DOWNLOAD MY PASS"}
            {exporting ? (
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
            Register another student <ArrowUpRight size={14} />
          </button>
        </div>
      ) : (
        <form
          className="np-form"
          onSubmit={submit}
          noValidate
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <fieldset className="np-fields" disabled={register.isPending}>
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
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="Choose your pass photo"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    void choosePhoto(file);
                  }}
                />
              </label>
              <span className="np-photo-status" role="status">
                {photoBusy ? "Processing photo on this device." : ""}
              </span>
            </div>
            <button
              className="np-submit"
              type="submit"
              disabled={register.isPending || photoBusy}
            >
              {register.isPending ? "SAVING YOUR SPOT…" : "GET MY PASS"}
              {register.isPending ? (
                <Loader2 className="np-loading" size={18} />
              ) : (
                <ArrowUpRight size={19} />
              )}
            </button>
          </fieldset>
          <p className="np-privacy">
            Your name, roll number and email go to the event guest list. Your
            photo stays on this device and is only used to make your pass.
          </p>
        </form>
      )}
      {error && (
        <p className="np-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
