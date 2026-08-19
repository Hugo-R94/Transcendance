import { useState, useEffect, Fragment } from "react";
import { useParams, Navigate } from "react-router-dom";
import DropdownFilter from "../components/dropdownFilter";
import { getTitleLabel } from "../components/titleManager";
import UserGameList from "../components/userGameList";
import UserReviews from "../components/userReviews";

type UserProfile = {
  id: string;
  username: string;
  description: string;
  title_1: string;
  title_2: string;
  profile_picture?: string;
};

type MenuOption = {
  label: string;
  value: string;
};

function UserProfil() {
  const { userid } = useParams<{ userid: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État pour gérer l'onglet actif (par défaut "game")
  const [activeTab, setActiveTab] = useState<string>("game");

  const currentUserId = localStorage.getItem("current_user_id");

  const menuOptions: MenuOption[] = [
    { label: "GAMES", value: "game" },
    { label: "REVIEWS", value: "reviews" },
    { label: "FRIENDS", value: "friends" },
    { label: "CLICKER", value: "clicker" },
  ];

  useEffect(() => {
    let objectUrl = "";

    const fetchUserProfileAndImage = async () => {
      if (!userid) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // STEP 1 : Récupérer d'abord le profil JSON
        const response = await fetch(`http://localhost:8080/api/v1/profil/${userid}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Utilisateur introuvable (${response.status})`);
        }

        const data: UserProfile = await response.json();
        setProfile(data);

        // STEP 2 : Charger la photo via /api/v1/getPP?userId=...
        const pictureResponse = await fetch(
          `http://localhost:8080/api/v1/getPP?userId=${userid}&t=${Date.now()}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (pictureResponse.ok) {
          const blob = await pictureResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        } else {
          console.warn(`Impossible de charger l'image custom (${pictureResponse.status})`);
          setImageSrc("https://thispersondoesnotexist.com/random-person.jpeg");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userid]);

  // Fonction pour afficher le contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "game":
        return <UserGameList userId={userid} />;
      case "reviews":
        return <UserReviews userId={userid} />;
      case "friends":
        return <div className="flex h-full w-full items-center justify-center text-white font-bold">Section Friends</div>;
      case "clicker":
        return <div className="flex h-full w-full items-center justify-center text-white font-bold">Section Clicker</div>;
      default:
        return <UserGameList userId={userid} />;
    }
  };

  if (currentUserId && userid === currentUserId) {
    return <Navigate to="/profil" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-bold">
        Chargement du profil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        {error || "Profil introuvable"}
      </div>
    );
  }

  const label1 = getTitleLabel(profile.title_1);
  const label2 = getTitleLabel(profile.title_2);

  const desktopTabs = [
    { label: "GAMES", value: "game", defaultColor: "bg-bblue" },
    { label: "REVIEWS", value: "reviews", defaultColor: "bg-bred" },
    { label: "FRIENDS", value: "friends", defaultColor: "bg-bgreen" },
    { label: "CLICKER", value: "clicker", defaultColor: "bg-byellow text-bdarkgreen" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* -------------------- VERSION DESKTOP -------------------- */}
      <main className="hidden sm:flex-1 sm:flex flex-col mx-[5%] w-[90%] pt-22 pb-4 h-screen max-h-screen">
        <div className="hidden sm:flex mt-3 w-full gap-3 lg:aspect-[12/1] sm:aspect-[8/1] p-2 flex-shrink-0">
          <div className="bg-gray-400 h-full aspect-square rounded-full ml-5 shadow-md shadow-black overflow-hidden outline-3 outline-white">
            <img
              className="w-full h-full object-cover"
              src={imageSrc}
              alt={`${profile.username} profile`}
            />
          </div>

          <div className="flex flex-col justify-center flex-shrink-0 p-1 text-left">
            <p className="font-bold text-md text-gray-300 whitespace-nowrap">
              {profile.username}
            </p>
            <p className="font-semibold text-sm text-gray-300/75">
              {label1} {label2}
            </p>
          </div>

          <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black p-3 backdrop-blur-md overflow-auto">
            <p className="font-bold md:text-md text-sm text-gray-300 mb-1">
              ABOUT ME :
            </p>
            <p className="text-gray-300/90 whitespace-pre-wrap">
              {profile.description || "Aucune description renseignée."}
            </p>
          </div>
        </div>

        {/* Barre de navigation / Onglets Desktop (avec style Balatro et contour blanc si actif) */}
        <div className="flex gap-3 my-3 h-15 rounded-2xl bg-[#334b4d] shadow-md shadow-black/75 text-white p-2 flex-shrink-0">
          {desktopTabs.map((tab, index) => {
            const isActive = activeTab === tab.value;
            return (
              <Fragment key={tab.value}>
                <button
                  onClick={() => setActiveTab(tab.value)}
                  className={`balatro flex-1 rounded-2xl shadow-md shadow-black transition ${tab.defaultColor} ${
                    isActive ? "outline-4 outline-white z-10 scale-[1.02]" : ""
                  }`}
                >
                  {tab.label}
                </button>
                {index < desktopTabs.length - 1 && <div className="w-px bg-white/10" />}
              </Fragment>
            );
          })}
        </div>

        {/* Contenu dynamique en fonction de l'onglet actif */}
        <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black my-2 backdrop-blur-md flex flex-col min-h-0 overflow-visible">
          {renderTabContent()}
        </div>
      </main>

      {/* -------------------- VERSION MOBILE -------------------- */}
      <div className="sm:hidden flex flex-col w-full min-h-screen p-2">
        <div className="bg-black w-[50%] mt-25 mx-auto overflow-hidden aspect-square rounded-full shadow-md shadow-black/75 outline-5 outline-white">
          <img
            className="w-full h-full object-cover"
            src={imageSrc}
            alt={`${profile.username} profile`}
          />
        </div>

        <div className="bg-bgreen p-3 mx-auto mt-3 w-fit h-fit rounded-2xl shadow-black shadow-md text-center">
          <p className="font-bold text-2xl text-white">{profile.username}</p>
          <p className="text-white/50 text-lg">
            {label1} {label2 ? `• ${label2}` : ""}
          </p>
        </div>

        <div className="bg-black/50 w-[90%] mx-[5%] h-fit p-3 rounded-2xl shadow-md shadow-black/70 my-3">
          <p className="text-white text-xl font-bold">ABOUT ME :</p>
          <p className="text-white/75 whitespace-pre-wrap mt-1">
            {profile.description || "Aucune description renseignée."}
          </p>
        </div>

        <DropdownFilter
          className="bg-bred w-[80%] mx-auto h-fit my-3 rounded-2xl shadow-black shadow-md"
          Name="SELECTION"
          color="bg-bred"
          items={menuOptions}
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
        />

        <div className="bg-black/50 rounded-2xl mt-3 w-full mb-5 flex flex-col overflow-visible p-2">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default UserProfil;