import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AdminWebsite from "./AdminWebsite";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminAuthProvider>
        <AdminWebsite />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
