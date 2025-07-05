import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { StrictMode } from "react";
import TourController from "./components/TourController.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <TourController />
    </AuthProvider>
  </StrictMode>
);
