import { useMemo } from "react";
import EmptyState from "../components/EmptyState.jsx";

function SourceList({ sources }) {
  const sorted = useMemo(() => {
    return [...(sources || [])].sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [sources]);
  return (
    <ul id="source-list" className="source-list">
      {sorted.map((s) => (
        <li key={s.name}>
          {s.name}
          <span className={s.ok ? "status ok" : "status err"}>{s.ok ? "reporting" : `down (${s.error ?? "no signal"})`}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Sources({ sources, loaded, offline }) {
  return (
    <section id="sources" className="section">
      <h2 className="section-title">Sources</h2>
      <p className="section-note">The feeds behind today's edition, verbatim. Dead sources are skipped automatically.</p>
      {loaded ? (
        offline ? (
          <EmptyState kicker="OUT TO LUNCH" text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment." />
        ) : (
          <SourceList sources={sources} />
        )
      ) : (
        <div className="h-6 w-60 animate-pulse rounded bg-muted" />
      )}
    </section>
  );
}
