// App.tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Games from "./pages/GameList";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Profil from "./pages/profil";
import Support from "./pages/support";
import Clicker from "./pages/clicker";
import ShaderBackground from "./components/utils/shaderBG";
import NavBar from "./components/utils/navBar";
import { ProtectedRoute } from "./components/utils/ProtectedRoute";
import UserProfil from "./pages/userProfilID";
import ChatMenu from "./components/chat/chatMenu";
import LanguageSwitcher from "./components/utils/LanguageSwitcher";
import Quest from "./pages/Quest.tsx";
import TermsOfServices from "./pages/Terms.tsx";

function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <ChatMenu />
      <Outlet />
    </>
  );
}

const RTL_LANGUAGES = ["ar"];

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = RTL_LANGUAGES.includes(i18n.language)
      ? "rtl"
      : "ltr";
  }, [i18n.language]);

  return (
    <div className="relative min-h-screen text-white">
      <ShaderBackground />

      <div className="fixed top-3 end-3 z-100">
        <LanguageSwitcher />
      </div>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/" element={<Home />} />

        {/* --- ROUTES PROTÉGÉES --- */}
        <Route element={<ProtectedRoute redirectTo="/login" />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/game/:appid" element={<GamePage />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/profil/:userid" element={<UserProfil />} />
            <Route path="/games" element={<Games />} />
            <Route path="/quest" element={<Quest />} />
            <Route path="/terms" element={<TermsOfServices />} />
            <Route path="/support" element={<Support />} />
            <Route path="/clicker" element={<Clicker />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;