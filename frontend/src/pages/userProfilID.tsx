import { useState, useEffect, Fragment } from "react";
import { useParams, Navigate } from "react-router-dom";
import DropdownFilter from "../components/utils/dropdownFilter";
import UserGameList from "../components/profile/userGameList";
import UserReviews from "../components/profile/userReviews";
import UserFriendsList from "../components/chat/userFriendList";
import { UserProfileHeader } from "../components/profile/UserProfileHeader";
import api from "../api/api"; // Utilisation de ton instance api configurée
import GambleHistory from "../components/profile/gambleHistory";

type UserProfile = {
  id: string;
  username: string;
  description: string;
  title_1: string;
  title_2: string;
  profile_picture?: string;
};

export default function UserProfil() {
  const { userid } = useParams<{ userid: string }>();
  const currentUserId = localStorage.getItem("current_user_id") || localStorage.getItem("userID");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("game");

  const menuOptions = [
    { label: "GAMES", value: "game" },
    { label: "REVIEWS", value: "reviews" },
    { label: "FRIENDS", value: "friends" },
    { label: "CLICKER", value: "clicker" },
  ];

  const desktopTabs = [
    { label: "GAMES", value: "game", defaultColor: "bg-bblue" },
    { label: "REVIEWS", value: "reviews", defaultColor: "bg-bred" },
    { label: "FRIENDS", value: "friends", defaultColor: "bg-bgreen" },
    { label: "CLICKER", value: "clicker", defaultColor: "bg-byellow text-bdarkgreen" },
  ];

  useEffect(() => {
    let objectUrl = "";

    const fetchProfileAndAvatar = async () => {
      if (!userid) return;

      try {
        setLoading(true);

        // Requêtes parallèles pour plus de rapidité (profil + avatar via ton instance api)
        const [profileRes, avatarRes] = await Promise.all([
          api.get(`/profil/${userid}`),
          api.get(`/getPP?userId=${userid}&t=${Date.now()}`, { responseType: "blob" }).catch(() => null)
        ]);

        setProfile(profileRes.data);

        if (avatarRes && avatarRes.status === 200) {
          objectUrl = URL.createObjectURL(avatarRes.data);
          setImageSrc(objectUrl);
        } else {
          setImageSrc("https://thispersondoesnotexist.com/random-person.jpeg");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndAvatar();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userid]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "game":
        return <UserGameList userId={userid} />;
      case "reviews":
        return <UserReviews userId={userid} />;
      case "friends":
        return <UserFriendsList userId={userid} />;
      case "clicker":
		return <GambleHistory userID={userid}  />;
      default:
        return <UserGameList userId={userid} />;
    }
  };

  // Redirection si l'utilisateur visite son propre profil via un lien externe
  if (currentUserId && userid === currentUserId) {
    return <Navigate to="/profil" replace />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-bold">Chargement du profil...</div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || "Profil introuvable"}</div>;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* -------------------- VERSION DESKTOP -------------------- */}
      <main className="hidden sm:flex-1 sm:flex flex-col mx-[5%] w-[90%] pt-22 pb-4 h-screen max-h-screen">
        <UserProfileHeader profile={profile} imageSrc={imageSrc} />

        {/* Barre d'onglets Desktop */}
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

        <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black my-2 backdrop-blur-md flex flex-col min-h-0 overflow-visible">
          {renderTabContent()}
        </div>
      </main>

      {/* -------------------- VERSION MOBILE -------------------- */}
      <div className="sm:hidden flex flex-col w-full min-h-screen p-2">
        <UserProfileHeader profile={profile} imageSrc={imageSrc} />

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