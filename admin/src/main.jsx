import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ClerkProvider } from "@clerk/react";

const PUSLISTABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUSLISTABLE_KEY) {
  throw new Error("Missing publishable key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUSLISTABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
