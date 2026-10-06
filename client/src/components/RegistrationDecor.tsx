export default function RegistrationDecor() {
  return (
    <div className="registration-decor" aria-hidden="true">
      <div className="hanging-ball hanging-ball--left">
        <div className="hanging-ball__photo" />
      </div>
      <div className="hanging-ball hanging-ball--right">
        <div className="hanging-ball__photo" />
      </div>
      <div className="silver-star silver-star--left">
        <img src="/images/freshers/silver-star.png" alt="" draggable={false} />
      </div>
      <div className="silver-star silver-star--right">
        <img src="/images/freshers/silver-star.png" alt="" draggable={false} />
      </div>
      <span className="registration-scribble registration-scribble--left">
        see you
        <br />
        under the lights
      </span>
      <span className="registration-scribble registration-scribble--right">
        save a dance
        <br />
        for us.
      </span>
    </div>
  );
}
