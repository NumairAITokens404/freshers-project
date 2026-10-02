import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowDownRight } from "lucide-react";
import { EVENT } from "@shared/event";

function Act({ index }: { index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [65, -65]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 1],
    [0.35, 1, 1, 0.35]
  );
  const item = EVENT.schedule[index];
  return (
    <article className="story-act" id={`act-${index + 1}`} ref={ref}>
      <motion.div className="story-copy" style={reduced ? {} : { y, opacity }}>
        <div className="story-meta">
          <span>ACT / 0{index + 1}</span>
          <span>{item.time}</span>
        </div>
        <p className="story-label">{item.label}</p>
        <h3>
          {item.headline[0]}
          <br />
          <em>{item.headline[1]}</em>
        </h3>
        <div className="story-detail">
          <span className="story-cross">+</span>
          <div>
            <h4>{item.title}</h4>
            <span className="story-translation">{item.translation}</span>
            <p>{item.detail}</p>
          </div>
        </div>
        <a
          className="story-next"
          href={index < 4 ? `#act-${index + 2}` : "#lineup"}
        >
          {index < 4 ? "THE NEXT CHAPTER" : "THE FULL RUN OF SHOW"}
          <ArrowDownRight size={17} />
        </a>
      </motion.div>
      <span className="story-large-number" aria-hidden="true">
        0{index + 1}
      </span>
    </article>
  );
}
export default function DiscoExperience() {
  return (
    <div className="scroll-acts">
      {EVENT.schedule.map((item, index) => (
        <Act key={item.title} index={index} />
      ))}
    </div>
  );
}
