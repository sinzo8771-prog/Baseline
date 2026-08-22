import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="ed">
      <header className="page-head pt-16 pb-10 text-center">
        <span className="fp-kicker">Error · Page not found</span>
        <h1 className="page-title">404</h1>
        <p className="page-deck">
          The presses couldn't find that page. It may have aged out of the edition, or the address was mistyped.
        </p>
      </header>
      <div className="pb-16 text-center">
        <Link className="btn-outline inline-block" to="/">Back to the front page</Link>
      </div>
    </div>
  );
}
