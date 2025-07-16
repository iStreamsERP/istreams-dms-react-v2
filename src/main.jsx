import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { StrictMode } from "react";
import TourController from "./components/TourController.jsx";
import { Provider } from "react-redux";
import store from "./app/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <App />
        <TourController />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
