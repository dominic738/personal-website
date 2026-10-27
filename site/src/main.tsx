import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "7.css/dist/7.scoped.css";
import "./styles/global.css";
import App from "./App.tsx";

// Count the visit once per page load, outside React so reopening windows can't repeat it
fetch(`${import.meta.env.VITE_API_BASE}/visit`, {
  method: "POST",
}).catch((err) => console.error("Failed to count visit:", err));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
