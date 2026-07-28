import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/login" }: ProtectedRouteProps) => {
  // Récupère ton token (ex: localStorage, cookies, ou context d'auth)
  const token = localStorage.getItem("token");

  if (!token) {
    // Si pas de token, on redirige vers l'URL spécifiée (ex: /login)
    return <Navigate to={redirectTo} replace />;
  }

  // Si le token existe, on affiche le contenu de la route
  return <Outlet />;
};