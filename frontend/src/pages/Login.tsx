import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/notification";
import ShaderBackground from "../components/shaderBG";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // État pour la notification
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setNotificationMessage("Veuillez remplir tous les champs.");
      return;
    }

    const data = { username, password };

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erreur serveur : ${response.status}`);
      }

      // Stockage du token
      localStorage.setItem("token", result.token);

      // Notification de succès
      setNotificationMessage("Connexion réussie ! Redirection...");

      // Réinitialisation des champs
      setUsername("");
      setPassword("");

      // Redirection vers Home après un court délai pour laisser le temps de voir la notif
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error: any) {
      console.error("Login error:", error);
      setNotificationMessage(
        error.message || "Impossible de se connecter. Vérifiez vos identifiants."
      );
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Notification globale */}
      {notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}


      <div className="absolute h-100 w-70 bg-white m-auto inset-0">
        <div
          id="card"
          className="absolute bg-gray-800 outline-10 outline-gray-400 h-100 w-70 p-2 rounded-2xl transition-all duration-300"
        />

        <form
          onSubmit={handleSubmit}
          className="absolute flex flex-col w-70 h-100 bg-[#334b4d] rounded-2xl p-3 focus:shadow-2xl shadow-lg shadow-black outline-10 outline-gray-300 transition"
        >
          <Link
            to="/signin"
            className="balatro z-15 rounded-full text-gray-300 outline-1 bg-[#00509f] w-full h-10 text-center font-bold shadow-md shadow-black p-2 hover:scale-105 active:scale-90 flex items-center justify-center"
          >
            SIGNIN
          </Link>

          <img
            src="https://cdn2.steamgriddb.com/logo/2553761c31ac33576b6030cf1a70a08b.png"
            className="z-15 scale-70 mt-5"
            alt="Logo"
          />

          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="balatro z-15 bg-[#ed8a00] hover:outline-2 hover:outline-white focus:bg-[#ffaa00] focus:scale-105 w-full h-15 mb-5 rounded-2xl p-2 outline-0 shadow-md shadow-black active:scale-90 text-gray-700"
            placeholder="Enter your email or username..."
          />

          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="balatro hover:outline-2 hover:outline-white z-15 bg-[#fb4740] focus:bg-[#ff3830] focus:scale-105 w-full h-15 mb-5 rounded-2xl p-2 outline-0 active:scale-90 shadow-md shadow-black text-gray-700"
            placeholder="Enter your password..."
          />

          <button
            type="submit"
            className="balatro bg-[#3c9b71] w-2/3 h-15 inset-0 mx-auto rounded-2xl text-xl font-bold shadow-md shadow-black text-gray-300 hover:scale-105 hover:outline-2 active:scale-90 transition"
          >
            login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;