import { createContext, useContext, useEffect, useState } from "react";
import driverApi from "../api/driverClient";

const DriverAuthContext = createContext(null);

export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("chalo-driver-token");
    if (!token) {
      setLoading(false);
      return;
    }

    driverApi
      .get("/drivers/auth/dashboard")
      .then((response) => setDriver(response.data.driver))
      .catch(() => {
        localStorage.removeItem("chalo-driver-token");
        setDriver(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { data } = await driverApi.post("/drivers/auth/login", payload);
    localStorage.setItem("chalo-driver-token", data.token);
    setDriver(data.driver);
    return data.driver;
  };

  const logout = () => {
    localStorage.removeItem("chalo-driver-token");
    setDriver(null);
  };

  return <DriverAuthContext.Provider value={{ driver, loading, login, logout, setDriver }}>{children}</DriverAuthContext.Provider>;
}

export function useDriverAuth() {
  return useContext(DriverAuthContext);
}
