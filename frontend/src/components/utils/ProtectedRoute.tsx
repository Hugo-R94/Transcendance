import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/login" }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const expirationStr = localStorage.getItem("token_expiration");
  const refreshToken = localStorage.getItem("refresh_token");

  console.log("--- DEBUG PROTECTED ROUTE ---");
  console.log("Token présent :", !!token);
  console.log("Refresh Token présent :", !!refreshToken);
  console.log("Temps avant expiration (secondes) :", expirationStr ? Math.floor((Number(expirationStr) - Date.now()) / 1000) : "N/A");

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
    console.log("Tentative de déclenchement du refresh...");
    refreshTokenInBackground();
  }, []);	
  return <Outlet />; 
};

async function refreshTokenInBackground() {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.warn("Aucun refresh_token trouvé dans le localStorage !");
      return;
    }

    const endpoint = "http://localhost:8080/refresh";
    
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
      console.log("Token rafraîchi avec succès !");
    }
  } catch (error) {
    console.error("Échec du rafraîchissement automatique du token :", error);
  }
}