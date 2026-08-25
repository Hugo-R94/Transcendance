import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/notification";
import api from "../api/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [notificationMessage, setNotificationMessage] =
    useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setNotificationMessage("Veuillez remplir tous les champs.");
      return;
    }

    const data = {
      username,
      password,
    };

    try {
      /*
       * =========================
       * LOGIN
       * =========================
       */

      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Erreur serveur : ${response.status}`
        );
      }

      /*
       * =========================
       * SESSION
       * =========================
       */

      localStorage.setItem(
        "token",
        result.token
      );
	  localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem(
        "token_expiration",
        String(
          Date.now() +
          result.expires_in * 1000
        )
      );

      localStorage.setItem(
        "userID",
        String(result.user_ID)
      );

      localStorage.setItem(
        "chatOpen",
        "false"
      );

      console.log(
        "USER ID STOCKÉ =",
        localStorage.getItem("userID")
      );

      /*
       * =========================
       * PHOTO DE PROFIL
       * =========================
       *
       * On récupère le blob depuis l'API
       * puis on le transforme en Data URL.
       *
       * IMPORTANT :
       * On ne fait PAS URL.createObjectURL()
       * ici car le blob: URL peut devenir
       * inutilisable après un changement de contexte.
       */

      try {
        const ppRes = await api.get(
          `/getPP?userID=${result.user_ID}`,
          {
            responseType: "blob",
          }
        );

        const reader = new FileReader();

        reader.onloadend = () => {
          if (
            typeof reader.result === "string"
          ) {
            localStorage.setItem(
              "userPP",
              reader.result
            );

            console.log(
              "PHOTO STOCKÉE DANS userPP"
            );
          }
        };

        reader.readAsDataURL(ppRes.data);

      } catch (ppErr) {
        console.error(
          "Erreur lors de la récupération de la photo de profil :",
          ppErr
        );

        /*
         * Si aucune photo n'est disponible,
         * on supprime une éventuelle ancienne photo.
         */
        localStorage.removeItem("userPP");
      }

      /*
       * =========================
       * NOTIFICATION
       * =========================
       */

      setNotificationMessage(
        "Connexion réussie ! Redirection..."
      );

      setUsername("");
      setPassword("");

      /*
       * =========================
       * REDIRECTION
       * =========================
       */

      setTimeout(() => {
        navigate("/games");
      }, 1000);

    } catch (error: any) {
      console.error(
        "Login error:",
        error
      );

      setNotificationMessage(
        error.message ||
          "Impossible de se connecter. Vérifiez vos identifiants."
      );
    }
  }

  return (
    <div className="relative min-h-screen">

      {notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={() =>
            setNotificationMessage(null)
          }
        />
      )}

      <div
        className="
          absolute
          inset-0
          m-auto
          h-100
          w-70
          bg-white
        "
      >

        <div
          id="card"
          className="
            absolute
            h-100
            w-70
            rounded-2xl
            bg-gray-800
            p-2
            outline-10
            outline-gray-400
            transition-all
            duration-300
          "
        />

        <form
          onSubmit={handleSubmit}
          className="
            absolute
            flex
            h-100
            w-70
            flex-col
            rounded-2xl
            bg-[#334b4d]
            p-3
            shadow-lg
            shadow-black
            outline-10
            outline-gray-300
            transition
            focus:shadow-2xl
          "
        >

          {/* SIGN IN */}

          <Link
            to="/signin"
            className="
              balatro
              z-15
              flex
              h-10
              w-full
              items-center
              justify-center
              rounded-full
              bg-[#00509f]
              p-2
              text-center
              font-bold
              text-gray-300
              shadow-md
              shadow-black
              outline-1
              hover:scale-105
              active:scale-90
            "
          >
            SIGNIN
          </Link>


          {/* LOGO */}

          <img
            src="https://cdn2.steamgriddb.com/logo/2553761c31ac33576b6030cf1a70a08b.png"
            className="
              z-15
              mt-5
              scale-70
            "
            alt="Logo"
          />


          {/* USERNAME */}

          <input
            onChange={(e) =>
              setUsername(e.target.value)
            }
            value={username}
            className="
              balatro
              z-15
              mb-5
              h-15
              w-full
              rounded-2xl
              bg-[#ed8a00]
              p-2
              text-gray-700
              shadow-md
              shadow-black
              outline-0
              hover:outline-2
              hover:outline-white
              focus:scale-105
              focus:bg-[#ffaa00]
              active:scale-90
            "
            placeholder="Enter your email or username..."
          />


          {/* PASSWORD */}

          <input
            onChange={(e) =>
              setPassword(e.target.value)
            }
            value={password}
            type="password"
            className="
              balatro
              z-15
              mb-5
              h-15
              w-full
              rounded-2xl
              bg-[#fb4740]
              p-2
              text-gray-700
              shadow-md
              shadow-black
              outline-0
              hover:outline-2
              hover:outline-white
              focus:scale-105
              focus:bg-[#ff3830]
              active:scale-90
            "
            placeholder="Enter your password..."
          />


          {/* LOGIN */}

          <button
            type="submit"
            className="
              balatro
              mx-auto
              h-15
              w-2/3
              rounded-2xl
              bg-[#3c9b71]
              text-xl
              font-bold
              text-gray-300
              shadow-md
              shadow-black
              hover:scale-105
              hover:outline-2
              active:scale-90
              transition
            "
          >
            login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;