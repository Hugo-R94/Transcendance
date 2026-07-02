import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Signin from "./pages/Signin";

function App() {
  return (
	
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>
  );
}

export default App;	