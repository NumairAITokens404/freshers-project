export type Memory = {
  label: string;
  copy: string;
  image?: string;
  alt?: string;
};

// Add local /images/... URLs and descriptive alt text as last year's photos arrive.
export const memories: Memory[] = [
  {
    label: "THE FIRST HELLO",
    copy: "An awkward smile. A name to remember. The beginning of everything.",
  },
  {
    label: "FINDING OUR PEOPLE",
    copy: "A few familiar faces became our favourite part of showing up.",
  },
  {
    label: "BETWEEN CLASSES",
    copy: "The conversations that always needed just five more minutes.",
  },
  {
    label: "OUR USUAL CORNER",
    copy: "Same table. Extra chairs. Always room for one more.",
  },
  {
    label: "TAKING THE STAGE",
    copy: "Shaky hands, loud cheers, and a room full of people rooting for us.",
  },
  {
    label: "TURN IT UP",
    copy: "Nobody knew all the steps. Everybody knew the feeling.",
  },
  {
    label: "THE LITTLE THINGS",
    copy: "Shared notes, stolen fries, and the jokes that never got old.",
  },
  {
    label: "ONE MORE PHOTO",
    copy: "Someone blinked. Someone laughed. We kept it anyway.",
  },
  {
    label: "STAY A LITTLE",
    copy: "When going home felt like the least interesting plan.",
  },
  {
    label: "STILL US",
    copy: "A year later, the best part is still the people in the picture.",
  },
];
