import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Website from "./Website";
import { AuthProvider } from "./context/AuthContext";
import { DriverAuthProvider } from "./context/DriverAuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <DriverAuthProvider>
          <Website />
        </DriverAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
