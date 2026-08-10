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
