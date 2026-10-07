export const EVENT = {
  title: "JASHN",
  date: "16 October",
  venue: "E-302",
  time: "9:30 AM – 12:30 PM",
  schedule: [
    {
      time: "09:30 AM",
      title: "The Kickoff",
      translation: "Welcome / First hellos",
      label: "Meet your people",
      headline: ["STRANGERS?", "NOT FOR LONG."],
      detail:
        "Welcoming our guests and juniors. First hellos, fresh faces, and the start of something good.",
      color: "#fc73d3",
    },
    {
      time: "10:30 AM",
      title: "Centre Stage",
      translation: "Performances / Bring the noise",
      label: "Showtime",
      headline: ["YOUR STAGE.", "YOUR MOMENT."],
      detail:
        "Performances by seniors and juniors. Big talent, louder cheers, and a stage for both batches.",
      color: "#bba0ff",
    },
    {
      time: "12:30 PM",
      title: "Dancefloor Takeover",
      translation: "DJ set / All in",
      label: "The DJ set",
      headline: ["BASS UP.", "ALL IN."],
      detail:
        "The complete DJ dance session. Seniors and juniors, one floor — nobody left on the sidelines.",
      color: "#d9ff43",
    },
    {
      time: "01:00 PM",
      title: "Refuel & Recharge",
      translation: "Lunch / Take five",
      label: "Fuel break",
      headline: ["GOOD FOOD.", "BETTER COMPANY."],
      detail:
        "Lunch with the crew. Refuel, trade stories, and save some energy for round two.",
      color: "#ffb078",
    },
    {
      time: "02:00 PM",
      title: "Round Two",
      translation: "Games + hangout / Keep it going",
      label: "Games & good chaos",
      headline: ["NOT DONE.", "JUST REFUELLED."],
      detail:
        "Post-lunch games, laughs, and one last burst of chaos together. Keep the fun going until 4:00 PM.",
      color: "#71e6ed",
    },
  ],
} as const;
