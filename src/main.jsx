import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./app/styles.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);