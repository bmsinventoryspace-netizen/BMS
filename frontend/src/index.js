import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import ErrorBoundary from "./components/ErrorBoundary";

// Support for older browsers - fallback to legacy API
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  // Try modern API first (React 18+)
  if (ReactDOM.createRoot) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } else {
    // Fallback for older React versions
    ReactDOM.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
      rootElement
    );
  }
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: #dc2626;">Erreur de chargement</h1>
      <p>Votre navigateur n'est pas compatible. Veuillez le mettre à jour.</p>
      <p style="font-size: 12px; color: #666;">${error.message}</p>
    </div>
  `;
}
