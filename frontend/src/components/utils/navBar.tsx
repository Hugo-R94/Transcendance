import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchBar";
import ButtonLink from "./buttonLink";
import DropdownMenu from "./DropdownMenu";
import Notification from "./notification";
import SvgCoinPile from "./svgCoinPile";
import SvgProfile from "./svgProfile";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null); // State pour le message de notification
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        const response = await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setNotification("Déconnexion réussie !");
        } else {
          setNotification("Déconnexion forcée (session expirée/serveur indisponible)");
        }
      } else {
        setNotification("Déconnexion effectuée");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion backend :", error);
      setNotification("Erreur réseau : déconnexion locale effectuée.");
    } finally {
      // Nettoyage du token
      localStorage.removeItem("token");

      // Attendre un court instant (1.5s) pour que l'utilisateur puisse lire la notification
      setTimeout(() => {
        setNotification(null);
        navigate("/login", { replace: true });
      }, 1500);
    }
  };

  return (
    <div className="flex items-center bg-bdarkgreen w-[90%] sm:h-18 h-15 inset-0 p-1.5 fixed rounded-lg my-4 mx-auto shadow-sm shadow-black z-9999">
      {/* Affichage conditionnel de la notification */}
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      <ButtonLink
        link="http://localhost:5173/games"
        color="bg-[#00509f]"
        className="m-auto font-extrabold lg:text-xl md:text-sm sm:text-sm text-xs transition mr-5"
      >
        <p>
          <span className="text-white">Click</span>
          <span className="text-[#ef4639]">Bet</span>
        </p>
      </ButtonLink>

      <div className="relative overflow-visible m-auto h-10 rounded-lg group hover:outline-2 hover:outline-white active:scale-90">
        <SearchBar />
      </div>

      <ButtonLink
        link="http://localhost:5173/clicker"
        color="bg-[#fb4740]"
        className="hidden sm:flex"
      >
		<SvgCoinPile/>
        <p className="my-auto text-xl text-white sm:inline hidden font-bold">
          Gamble
        </p>
      </ButtonLink>

      <ButtonLink
        link="http://localhost:5173/profil"
        color="bg-[#3c9b71]"
        className="hidden sm:flex"
      >
		<SvgProfile/>
        <p className="mr-5 my-auto text-white text-xl sm:inline hidden font-bold">
          Profil
        </p>
      </ButtonLink>

      <DropdownMenu
       	className="rounded-2xl ml-3 shadow-black/50 shadow-md hidden sm:flex sm:w-[10%] items-center justify-center h-full"
        color="bg-bred"
        items={[
          { label: "Home", href: "/games" },
          { label: "Profil", href: "/profil" },
          { label: "Support", href: "/support" },
		  { label: "clicker", href: "/clicker"},
		  { label: "Privacy and terms", href: "/terms"},
          { label: "Logout", onClick: handleLogout },
        ]}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8 shrink-0 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>

        <p className="hidden lg:block text-white font-bold text-xl whitespace-nowrap">
          MENU
        </p>
      </DropdownMenu>
	  
	    <DropdownMenu
        className="rounded-2xl ml-3 shadow-black/50 shadow-md sm:w-[10%] w-20 flex items-center justify-center h-full sm:hidden"
        color="bg-bred"
        items={[
          { label: "Home", href: "/games" },
          { label: "Profil", href: "/profil" },
          { label: "Support", href: "/support" },
		  { label: "clicker", href: "/clicker"},
		  { label: "chat", href: "/chat"},
		  { label: "Privacy and terms", href: "/terms"},
          { label: "Logout", onClick: handleLogout },
        ]}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-8 shrink-0 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>

        <p className="hidden lg:block text-white font-bold text-xl whitespace-nowrap">
          MENU
        </p>
      </DropdownMenu>
	  
    </div>
  );
}

export default NavBar;