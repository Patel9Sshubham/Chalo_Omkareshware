import axios from "axios";

const driverApi = axios.create({
  baseURL: "/api"
});

driverApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("chalo-driver-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default driverApi;
