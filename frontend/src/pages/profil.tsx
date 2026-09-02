import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileMenu from "../components/profile/profilMenu";
import UserGameList from "../components/profile/userGameList";
import Notification from "../components/utils/notification";
import { ProfileHeader } from "../components/profile/profilHeader";
import UserReviews from "../components/profile/userReviews";
import UserFriendsList from "../components/chat/userFriendList";
import { fetchUserProfilePicture } from "../api/getUserAvatar";
import api from "../api/api";
import GambleHistory from "../components/profile/gambleHistory";

export type UserProfile = {
  id?: string;
  username: string;
  description: string;
  title_1: string;
  title_2: string;
  profile_picture: string;
};

export default function Profil() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingDesc, setIsSavingDesc] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("game");

  const userID = localStorage.getItem("userID");

  useEffect(() => {
    let objectUrl = "";

    const loadProfileData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError(t("profile.errors.notAuthenticated"));
          setLoading(false);
          return;
        }

        const [ppUrl, profileRes] = await Promise.all([
          fetchUserProfilePicture().catch(() => ""),
          api.get("/profil"),
        ]);

        if (ppUrl) {
          objectUrl = ppUrl;
          setImageSrc(ppUrl);
        }

        const data: UserProfile = profileRes.data;

        setProfile(data);
        setDescription(data.description || "");

        if (data.id) {
          localStorage.setItem("userID", String(data.id));
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            t("profile.errors.generic")
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      await api.post("/changePP", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }

      const newImageUrl = URL.createObjectURL(file);

      setImageSrc(newImageUrl);
      setNotification(t("profile.success.pictureUpdated"));
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          t("profile.errors.pictureUpdateFailed")
      );
    }
  };

  const handleSaveDescription = async () => {
    setIsSavingDesc(true);

    try {
      await api.post("/profil/description", {
        description,
      });

      if (profile) {
        setProfile({
          ...profile,
          description,
        });
      }

      setNotification(t("profile.success.descriptionSaved"));
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          t("profile.errors.saveDescriptionFailed")
      );
    } finally {
      setIsSavingDesc(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "game":
        return <UserGameList />;

      case "reviews":
        return <UserReviews />;

      case "friends":
        return (
          <UserFriendsList
            userId={userID ?? profile?.id}
          />
        );

      case "gambles":
        return (
          <GambleHistory
            userID={userID ?? profile?.id}
          />
        );

      default:
        return <UserGameList />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-bold">
        {t("profile.loading")}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        {error || t("profile.notFound")}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      <main className="hidden sm:flex sm:flex-col mx-[5%] w-[90%] pt-20 pb-4 h-screen overflow-hidden">
        <ProfileHeader
          profile={profile}
          imageSrc={imageSrc}
          description={description}
          isSavingDesc={isSavingDesc}
          onDescriptionChange={setDescription}
          onSaveDescription={handleSaveDescription}
          onImageChange={handleImageChange}
        />

        <div className="flex-shrink-0 my-2">
          <ProfileMenu
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="flex-1 min-h-0 bg-black/50 rounded-2xl p-4 backdrop-blur-md shadow-black shadow-md flex flex-col overflow-y-auto">
          {renderTabContent()}
        </div>
      </main>

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

        <div className="flex-shrink-0">
          <ProfileMenu
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="bg-black/50 rounded-2xl mt-3 w-full min-h-[400px] mb-5 flex flex-col overflow-y-auto p-2">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}