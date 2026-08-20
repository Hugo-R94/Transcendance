// App.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Games from "./pages/GameList";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Profil from "./pages/profil";
import Support from "./pages/support";
import Clicker from "./pages/clicker";
import ShaderBackground from "./components/shaderBG";
import NavBar from "./components/navBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UserProfil from "./pages/userProfilID";
import MinimalChat from "./pages/minichat";
import ChatMenu from "./components/chatMenu";

function ProtectedLayout() {
  return (
    <>
      <NavBar />
	  <ChatMenu />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <div className="relative min-h-screen text-white">
      <ShaderBackground />

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
            <Route path="/chat" element={<MinimalChat />} />
            <Route path="/support" element={<Support />} />
            <Route path="/clicker" element={<Clicker />} /> 
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;