import { Component } from "react";
import EmptyState from "./EmptyState.jsx";

// Catches render/lifecycle errors anywhere below it so a single bad story,
// bad feed shape, or stray bug takes down one screen, not the whole app.
// Deliberately a class component: getDerivedStateFromError/componentDidCatch
// have no hook equivalent yet.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // No error-reporting service wired up yet; console keeps this visible in
    // devtools without pulling in a dependency for it.
    console.error("The Baseline crashed:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="section">
          <EmptyState
            kicker="STOP THE PRESSES"
            text="Something broke on our end, not yours. A reload usually clears it."
            action={{ label: "Reload the page", onClick: this.handleReload }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
