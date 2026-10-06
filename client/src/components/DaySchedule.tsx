import { EVENT } from "@shared/event";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function DaySchedule() {
  return (
    <GlowCard
      className="day-schedule"
      glowColor="green"
      role="region"
      aria-label="Schedule of the day"
    >
      <p className="section-kicker">THE DAY, AT A GLANCE</p>
      <h2>
        SIX HOURS. <em>ALL OURS.</em>
      </h2>
      <ol>
        {EVENT.schedule.map(act => (
          <li key={act.title}>
            <time>{act.time.replace(/^0/, "")}</time>
            <div>
              <h3>{act.title}</h3>
              <p>{act.label}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="day-schedule__note">
        Until 4:00 PM · Timings are provisional.
      </p>
    </GlowCard>
  );
}
