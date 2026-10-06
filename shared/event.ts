export const EVENT = {
  title: "JASHN",
  date: "16 October",
  venue: "E-302",
  time: "10:00 AM – 4:00 PM",
  schedule: [
    {
      time: "10:00 AM",
      title: "Bienvenidos",
      translation: "Spanish / Welcome",
      label: "The welcome",
      headline: ["STRANGERS?", "NOT FOR LONG."],
      detail:
        "Welcoming our guests and juniors. First hellos, fresh faces, and the start of something good.",
      color: "#fc73d3",
    },
    {
      time: "10:30 AM",
      title: "Sous les Projecteurs",
      translation: "French / In the spotlight",
      label: "The spotlight",
      headline: ["YOUR STAGE.", "YOUR MOMENT."],
      detail:
        "Performances by seniors and juniors. Big talent, louder cheers, and a stage for both batches.",
      color: "#bba0ff",
    },
    {
      time: "11:45 AM",
      title: "Tutti in Pista",
      translation: "Italian / Everyone on the dance floor",
      label: "The DJ takeover",
      headline: ["BASS UP.", "ALL IN."],
      detail:
        "The complete DJ dance session. Seniors and juniors, one floor — nobody left on the sidelines.",
      color: "#d9ff43",
    },
    {
      time: "01:15 PM",
      title: "Buon Appetito",
      translation: "Italian / Enjoy your meal",
      label: "The lunch break",
      headline: ["GOOD FOOD.", "BETTER COMPANY."],
      detail:
        "Lunch with the crew. Refuel, trade stories, and save some energy for round two.",
      color: "#ffb078",
    },
    {
      time: "02:00 PM",
      title: "Carpe Diem: The Encore",
      translation: "Latin + English / Seize the day, one more time",
      label: "The after-lunch club",
      headline: ["NOT DONE.", "JUST REFUELLED."],
      detail:
        "Post-lunch games, laughs, and one last burst of chaos together. Keep the fun going until 4:00 PM.",
      color: "#71e6ed",
    },
  ],
} as const;
