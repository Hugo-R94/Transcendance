import axios from "axios";
import i18n from "../i18n";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 1. Interceptor de requête (ce que vous avez déjà)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = i18n.language;
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token invalide ou expiré détecté par le serveur.");


      localStorage.removeItem("token");
      localStorage.removeItem("token_expiration");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;