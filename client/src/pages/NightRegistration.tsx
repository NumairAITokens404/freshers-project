import { ArrowLeft, Disc3 } from "lucide-react";
import NightPass from "@/components/NightPass";
import { EVENT } from "@shared/event";

export default function NightRegistration() {
  return (
    <div className="night-registration-page">
      <header className="night-registration-nav">
        <a href="/" className="night-back">
          <ArrowLeft size={17} /> BACK TO THE DISCO
        </a>
        <Disc3 size={28} />
      </header>
      <main className="night-registration-grid">
        <div className="night-pass-event" aria-label="Event details">
          <strong>{EVENT.date} ’26</strong>
          <span>{EVENT.venue} / MGIT</span>
          <span>{EVENT.time}</span>
        </div>
        <div className="night-pass-form">
          <NightPass />
          <section className="night-pass-faq">
            <h2>A FEW THINGS BEFORE THE FLOOR.</h2>
            {[
              [
                "Who’s invited?",
                "MGIT CSB students from the 2025 and 2026 batches. Register with your CSB college email and matching batch roll number.",
              ],
              [
                "What should I wear?",
                "Whatever makes you feel like you. Chrome, sparkle, and bold colours are encouraged, never required.",
              ],
              [
                "Is the schedule final?",
                "16 October, 10:00 AM–4:00 PM in E-701 is the plan. Individual activities and time slots are provisional until the organisers release the final schedule.",
              ],
              [
                "What happens to my photo?",
                "Your photo is processed on your device for the downloadable pass. It is not uploaded to Google Drive or saved to our server. Download your pass before leaving the page.",
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span>+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
