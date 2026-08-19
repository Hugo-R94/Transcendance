import { Navigate, Outlet } from "react-router-dom";
import api from "../api/api"; // Ton instance Axios configurée

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/login" }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const expirationStr = localStorage.getItem("token_expiration");

  if (!token || !expirationStr) {
    return <Navigate to={redirectTo} replace />;
  }

  const expirationTime = Number(expirationStr);
  const currentTime = Date.now();
  const refreshTime = 30 * 60 * 1000; // 30 min en ms 

  if (currentTime >= expirationTime) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
    return <Navigate to={redirectTo} replace />;
  }

  if (expirationTime - currentTime <= refreshTime) {
    refreshTokenInBackground();
  }

  return <Outlet />; 
};

async function refreshTokenInBackground() {
  try {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    const response = await api.post("/refresh", {}, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      
      if (response.data.expiration) {
        localStorage.setItem("token_expiration", response.data.expiration);
      }
    }
  } catch (error) {
    console.error("Échec du rafraîchissement automatique du token :", error);
  }
}