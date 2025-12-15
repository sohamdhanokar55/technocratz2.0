import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadRazorpayScript } from "./lib/loadRzp";

// Preload Razorpay script on app load to avoid popup blockers
loadRazorpayScript().catch((err) => {
  console.warn("Failed to preload Razorpay script:", err);
});

createRoot(document.getElementById("root")!).render(<App />);
