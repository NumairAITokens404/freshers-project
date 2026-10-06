import NightPass from "@/components/NightPass";
import { EVENT } from "@shared/event";
import RegistrationDecor from "@/components/RegistrationDecor";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function NightRegistration() {
  return (
    <div className="night-registration-page">
      <RegistrationDecor />
      <header className="night-registration-nav">
        <a href="/" className="night-back">
          BACK TO {EVENT.title}
        </a>
        <span className="jashn-wordmark">{EVENT.title}</span>
      </header>
      <main className="night-registration-grid">
        <div className="night-pass-event" aria-label="Event details">
          <strong>{EVENT.date} ’26</strong>
          <span>{EVENT.venue} / MGIT</span>
          <span>{EVENT.time}</span>
        </div>
        <div className="night-pass-form">
          <NightPass />
          <GlowCard
            className="night-pass-faq"
            role="region"
            aria-label="Registration questions"
          >
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
                `${EVENT.date}, ${EVENT.time} in ${EVENT.venue} is the plan. Individual activities and time slots are provisional until the organisers release the final schedule.`,
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
          </GlowCard>
        </div>
      </main>
    </div>
  );
}
