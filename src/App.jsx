import React from "react";
import { AppProvider } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import Toast from "./components/Toast";

export default function App() {
  return (
    <AppProvider>
      <LandingPage />
      <Toast />
    </AppProvider>
  );
}
