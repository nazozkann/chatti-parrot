export default function PenguinAnim({ className = "" }) {
  return (
    <object
      type="image/svg+xml"
      data="/animations/pinguin-animation.svg"
      className={className}
      aria-label="Penguin animation"
    />
  );
}
