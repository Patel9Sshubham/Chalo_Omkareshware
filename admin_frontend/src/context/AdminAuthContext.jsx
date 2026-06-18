import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("chalo-admin-token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/admin/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem("chalo-admin-token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/admin/auth/login", payload);
    localStorage.setItem("chalo-admin-token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("chalo-admin-token");
    setUser(null);
  };

  return <AdminAuthContext.Provider value={{ user, loading, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
