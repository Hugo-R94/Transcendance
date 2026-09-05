import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Notification from "../components/utils/notification";

function Signin() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [notificationMessage, setNotificationMessage] = useState<
    string | null
  >(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordCheck.trim()
    ) {
      setNotificationMessage(t("signin.errors.fillAllFields"));
      return;
    }

    if (password !== passwordCheck) {
      setNotificationMessage(t("signin.errors.passwordMismatch"));
      return;
    }

    /*
     * Vérification simple du format de l'e-mail
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setNotificationMessage(t("signin.errors.invalidEmail"));
      return;
    }

	const data = {
	username: username.trim().slice(0, 100),
	email: email.trim().slice(0, 100),
	password,
	};

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setNotificationMessage(
          result?.error ||
            t(
              "signin.errors.serverError",
              { status: response.status }
            )
        );
        return;
      }

      setNotificationMessage(t("signin.success"));

      setUsername("");
      setEmail("");
      setPassword("");
      setPasswordCheck("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      setNotificationMessage(t("signin.errors.registrationFailed"));
    }
  }

  return (
    <div className="relative min-h-screen">

      {notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}

      <div className="absolute h-100 w-70 bg-white m-auto inset-0">

        <div
          id="card"
          className="absolute bg-gray-800 outline-10 outline-gray-400 h-100 
            w-70 p-2 rounded-2xl transition-all duration-300"/>

        <form
          onSubmit={handleSubmit}
          className="absolute flex flex-col w-70 h-110 bg-[#334b4d]
            rounded-2xl p-3 focus:shadow-2xl shadow-lg shadow-black outline-10
            outline-gray-300 transition ">

          {/* LOGIN */}

          <Link
            to="/login"
            className="
              balatro z-15 rounded-full text-gray-300 outline-1
              bg-[#00509f] w-full h-10 text-center font-bold shadow-md
              shadow-black p-2 hover:scale-105  active:scale-90 flex
              items-center justify-center ">
            {t("signin.login")}
          </Link>

          <img
            src="https://cdn2.steamgriddb.com/logo/2553761c31ac33576b6030cf1a70a08b.png"
            className="z-15 scale-70 mt-3"
            alt={t("signin.logoAlt")}
          />

          {/* EMAIL */}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
			maxLength={100}
            className="balatro z-15 bg-byellow hover:outline-2 hover:outline-white
              focus:bg-[#ffaa00] focus:scale-105 w-full h-15 mb-5 rounded-2xl p-2
              outline-0 shadow-md shadow-black active:scale-90 text-gray-300 "
            placeholder={t("signin.emailPlaceholder")}
          />

          {/* USERNAME */}

          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            autoComplete="username"
			maxLength={100}
            className="balatro z-15 bg-bred hover:outline-2 hover:outline-white
              focus:bg-bgreen focus:scale-105 w-full h-15 mb-5 rounded-2xl p-2
              outline-0 shadow-md shadow-black active:scale-90 text-gray-300 "
            placeholder={t("signin.usernamePlaceholder")}
          />

          {/* PASSWORD */}

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
			maxLength={100}
            autoComplete="new-password"
            className="balatro hover:outline-2 hover:outline-white z-15 bg-bgreen
              focus:bg-[#ff3830] focus:scale-105 w-full h-15 mb-5 rounded-2xl p-2 outline-0
              active:scale-90 shadow-md shadow-black text-gray-300 "
            placeholder={t("signin.passwordPlaceholder")}
          />

          {/* CONFIRM PASSWORD */}

          <input
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            type="password"
            autoComplete="new-password"
			maxLength={100}
            className="balatro hover:outline-2 hover:outline-white z-15
              bg-bblue focus:bg-[#ff3830] focus:scale-105 w-full h-15 mb-5
              rounded-2xl p-2 outline-0 active:scale-90 shadow-md shadow-black text-gray-300"
            placeholder={t("signin.confirmPasswordPlaceholder")}
          />

          {/* SUBMIT */}

          <button
            type="submit"
            className="balatro bg-[#3c9b71] w-2/3 h-15 inset-0 mx-auto
              rounded-2xl text-xl font-bold shadow-md shadow-black text-gray-300
              hover:scale-105 hover:outline-2 active:scale-90 transition">
            {t("signin.submit")}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Signin;

