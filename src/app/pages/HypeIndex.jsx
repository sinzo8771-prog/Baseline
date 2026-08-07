import HypeMeter from "../components/HypeMeter.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function HypeIndex({ stats, loaded, offline }) {
  return (
    <section id="hype-index" className="section">
      <h2 className="section-title">The Hype Index</h2>
      <p className="section-note">Share of today's stories that are, let's say, enthusiastic.</p>
      {loaded && !offline && stats ? (
        <>
          <HypeMeter percent={stats.hypePercent} className="mb-5" />
          <p className="text-sm text-muted-foreground">
            {stats.bySpin.Measured} Measured · {stats.bySpin.Warm} Warm · {stats.bySpin.Hot} Hot · {stats.bySpin["On Fire"]} On Fire
          </p>
        </>
      ) : offline ? (
        <EmptyState kicker="OUT TO LUNCH" text="The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment." />
      ) : (
        <div className="h-6 w-60 animate-pulse rounded bg-muted" />
      )}
    </section>
  );
}
