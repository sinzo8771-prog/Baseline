export default function EmptyState({ kicker, text, action, className }) {
  return (
    <div className={`empty${className ? ` ${className}` : ""}`}>
      <div className="kicker">{kicker}</div>
      <p>{text}</p>
      {action ? (
        <button type="button" className="btn-outline" style={{ marginTop: 20 }} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
