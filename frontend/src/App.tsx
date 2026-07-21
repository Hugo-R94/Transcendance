import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Games from "./pages/GameList";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Profil from "./pages/profil";
import Support from "./pages/support";

function App() {
  return (
	
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/game/:appid" element={<GamePage />} />
	  <Route path="/" element={<Home />} />
	  <Route path="/profil" element={<Profil/>} />
	  <Route path="/games" element={<Games />} />	
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/support" element={<Support />} />
    </Routes>
  );
}

export default App;	