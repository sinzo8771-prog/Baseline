import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <h2 className="section-title">Page not found</h2>
      <p className="section-note">The presses couldn't find that page.</p>
      <Link className="btn-outline inline-block" to="/">Back to the front page</Link>
    </section>
  );
}
