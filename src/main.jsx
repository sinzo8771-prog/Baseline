import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import ErrorBoundary from "./app/components/ErrorBoundary.jsx";
import "./app/styles.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>,
);

// Register the offline-shell service worker in production builds only. In dev
// the worker could cache stale Vite assets and mask HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is a progressive enhancement; failure is non-fatal.
    });
  });
}
