import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initSentryIfConfigured } from "./app/utils/sentryInit";
import "./styles/index.css";

// Initialize error monitoring (runs only if VITE_SENTRY_DSN is set)
initSentryIfConfigured();

createRoot(document.getElementById("root")!).render(<App />);
