import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/login" }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const expirationStr = localStorage.getItem("token_expiration");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!token || !expirationStr) {
    return <Navigate to={redirectTo} replace />;
  }

  const expirationTime = Number(expirationStr);
  const currentTime = Date.now();

  if (currentTime >= expirationTime) {
    localStorage.clear();
    return <Navigate to={redirectTo} replace />;
  }

  useEffect(() => {
    refreshTokenInBackground();
  }, []);	
  return <Outlet />; 
};

async function refreshTokenInBackground() {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return;
    }

    const endpoint = "https://localhost:8443/refresh";
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data.expiration) {
        localStorage.setItem("token_expiration", data.expiration);
      }
    }
  } catch (error) {
  }
}
