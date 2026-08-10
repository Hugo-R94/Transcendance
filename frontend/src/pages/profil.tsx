import { useEffect, useState } from "react";
import ProfileMenu from "../components/profilMenu";
import UserGameList from "../components/userGameList";
import Notification from "../components/notification";
import { ProfileHeader } from "../components/profilHeader";
import UserReviews from "../components/userReviews";
import UserFriendsList from "../components/userFriendList";

export type UserProfile = {
  username: string;
  description: string;
  title_1: string;
  title_2: string;
  profile_picture: string;
};

function Profil() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState<string>("");
  const [isSavingDesc, setIsSavingDesc] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("game");

  useEffect(() => {
    let objectUrl = "";

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Non authentifié");
          return;
        }

        const pictureResponse = await fetch(
          `http://localhost:8080/api/v1/getPP?t=${Date.now()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (pictureResponse.ok) {
          const blob = await pictureResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }

        const profileResponse = await fetch("http://localhost:8080/api/v1/profil", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error(`Erreur serveur (${profileResponse.status})`);
        }

        const data: UserProfile = await profileResponse.json();
        setProfile(data);
        setDescription(data.description || "");
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const response = await fetch("http://localhost:8080/api/v1/changePP", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur lors de l'envoi (${response.status})`);
      }

      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(URL.createObjectURL(file));
      setNotificationMessage("Photo de profil mise à jour avec succès !");
    } catch (err: any) {
      alert(err.message || "Impossible de mettre à jour la photo de profil.");
    }
  };

  const handleSaveDescription = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSavingDesc(true);
    try {
      const response = await fetch("http://localhost:8080/api/v1/profil/description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Impossible de sauvegarder la description.");
      }

      if (profile) setProfile({ ...profile, description });
      setNotificationMessage("Description sauvegardée avec succès !");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSavingDesc(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "game":
        return <UserGameList />;
      case "reviews":
        return <UserReviews />
      case "friends":
        return <UserFriendsList />
        // return <div className="flex h-full w-full items-center justify-center text-white font-bold">Section Friends</div>;
      case "gambles":
        return <div className="flex h-full w-full items-center justify-center text-white font-bold">Section Gambles</div>;
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
      {notificationMessage && (
        <Notification message={notificationMessage} onClose={() => setNotificationMessage(null)} />
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

export default Profil;