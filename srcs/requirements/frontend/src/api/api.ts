import axios from "axios";
import i18n from "../i18n";
import { translateBackendError } from "./translateBackendError";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_V1,
});

const REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // refresh si moins de 10 min restantes

let refreshPromise: Promise<string | null> | null = null;

function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

// Décode le payload d'un JWT sans vérifier la signature (juste pour lire "exp")
function getJwtExpirationMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  // Le refresh token est déjà expiré côté client, inutile d'appeler le backend
  const refreshExpStr = localStorage.getItem("refresh_token_expiration");
  if (refreshExpStr && Number(refreshExpStr) <= Date.now()) {
    return null;
  }

  try {
    const response = await fetch(`https://localhost:8443/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.token || !data.expires_in) return null;

    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "token_expiration",
      String(Date.now() + data.expires_in * 1000)
    );

    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);

      const refreshExp = getJwtExpirationMs(data.refresh_token);
      if (refreshExp) {
        localStorage.setItem("refresh_token_expiration", String(refreshExp));
      }
    }

    return data.token;
  } catch {
    return null;
  }
}

// Empêche plusieurs refresh en parallèle (important si rotation du refresh token côté back)
function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// 1. Interceptor de requête
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");
  const expirationStr = localStorage.getItem("token_expiration");
  const refreshExpStr = localStorage.getItem("refresh_token_expiration");

  // Refresh token expiré : inutile d'attendre un 401, on logout direct
  if (refreshExpStr && Number(refreshExpStr) <= Date.now()) {
    logout();
    return Promise.reject(new Error("Refresh token expired"));
  }

  if (token && expirationStr) {
    const timeLeft = Number(expirationStr) - Date.now();

    if (timeLeft <= 0) {
      // token déjà expiré, inutile de tenter la requête
      logout();
      return Promise.reject(new Error("Token expired"));
    }

    const refreshTimeLeft = refreshExpStr
      ? Number(refreshExpStr) - Date.now()
      : Infinity;

    if (timeLeft < REFRESH_THRESHOLD_MS || refreshTimeLeft < REFRESH_THRESHOLD_MS) {
      const newToken = await refreshOnce();
      if (newToken) {
        token = newToken;
      }
      // si le refresh échoue, on laisse partir la requête avec l'ancien token,
      // le 401 sera géré par l'intercepteur de réponse en filet de sécurité
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = i18n.language;
  return config;
});

// 2. Interceptor de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.data?.error) {
      error.response.data.error = translateBackendError(error.response.data.error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshOnce();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      logout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;