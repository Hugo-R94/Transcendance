import React, { useState, useEffect } from "react";
import ProfileMenu from "../components/profilMenu";
import UserGameList from "../components/userGameList";
import Notification from "../components/notification";
import { ProfileHeader } from "../components/profilHeader";
import UserReviews from "../components/userReviews";
import UserFriendsList from "../components/userFriendList";
import { fetchUserProfilePicture } from "../api/getUserAvatar";
import api from "../api/api";
import GambleHistory from "../components/gambleHistory";
export type UserProfile = {
  id?: string;
  username: string;
  description: string;
  title_1: string;
  title_2: string;
  profile_picture: string;
};

export default function Profil() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingDesc, setIsSavingDesc] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("game");
  const userID = localStorage.getItem("userID");

  // Récupération des données du profil et de l'avatar au montage
  useEffect(() => {
    let objectUrl = "";

    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Non authentifié");
          setLoading(false);
          return;
        }

        // Chargement de l'avatar et du profil en parallèle
        const [ppUrl, profileRes] = await Promise.all([
          fetchUserProfilePicture().catch(() => ""),
          api.get("/profil")
        ]);

        if (ppUrl) {
          objectUrl = ppUrl;
          setImageSrc(ppUrl);
        }

        const data: UserProfile = profileRes.data;
        setProfile(data);
        setDescription(data.description || "");

        // Synchronisation éventuelle de l'ID utilisateur
        if (data.id) {
          localStorage.setItem("userID", String(data.id));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Gestion du changement de photo de profil
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      await api.post("/changePP", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(URL.createObjectURL(file));
      setNotification("Photo de profil mise à jour avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.error || "Impossible de mettre à jour la photo de profil.");
    }
  };

  // Sauvegarde de la description
  const handleSaveDescription = async () => {
    setIsSavingDesc(true);
    try {
      await api.post("/profil/description", { description });

      if (profile) setProfile({ ...profile, description });
      setNotification("Description sauvegardée avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSavingDesc(false);
    }
  };

  // Routage du contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case "game":
        return <UserGameList />;
      case "reviews":
        return <UserReviews />;
      case "friends":
        return <UserFriendsList userId={userID ?? profile?.id} />;
      case "gambles":
        return <GambleHistory userID={userID ?? profile?.id}  />;
      default:
        return <UserGameList />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-bold">Chargement du profil...</div>;
  }

  if (error || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || "Profil introuvable"}</div>;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {/* -------------------- VERSION DESKTOP -------------------- */}
      <main className="hidden sm:flex-1 sm:flex flex-col mx-[5%] w-[90%] pt-22 pb-4 h-screen max-h-screen">
        <ProfileHeader
          profile={profile}
          imageSrc={imageSrc}
          description={description}
          isSavingDesc={isSavingDesc}
          onDescriptionChange={setDescription}
          onSaveDescription={handleSaveDescription}
          onImageChange={handleImageChange}
        />

        <div className="flex-shrink-0">
          <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 bg-black/50 rounded-2xl my-2 backdrop-blur-md shadow-black shadow-md flex flex-col min-h-0 overflow-visible">
          {renderTabContent()}
        </div>
      </main>

      {/* -------------------- VERSION MOBILE -------------------- */}
      <div className="sm:hidden flex flex-col w-full min-h-screen p-2">
        <ProfileHeader
          profile={profile}
          imageSrc={imageSrc}
          description={description}
          isSavingDesc={isSavingDesc}
          onDescriptionChange={setDescription}
          onSaveDescription={handleSaveDescription}
          onImageChange={handleImageChange}
        />

        <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-black/50 rounded-2xl mt-3 w-full min-h-[400px] mb-5 flex flex-col overflow-visible p-2">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}