export default function EmptyState({ kicker, text, className }) {
  return (
    <div className={`empty${className ? ` ${className}` : ""}`}>
      <div className="kicker">{kicker}</div>
      <p>{text}</p>
    </div>
  );
}
