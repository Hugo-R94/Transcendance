import { useState, useEffect } from "react";
import api from "../api/api";

export function useUserAvatar(userId?: string) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!userId) {
      setAvatarUrl(undefined);
      return;
    }

    let objectUrl = "";
    let isMounted = true;

    const fetchAvatar = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.get(`/getPP?userId=${userId}&t=${Date.now()}`, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (isMounted && response.status === 200) {
          const blob = new Blob([response.data]);
          objectUrl = URL.createObjectURL(blob);
          setAvatarUrl(objectUrl);
        }
      } catch (err) {
        console.error("Erreur chargement avatar :", err);
      }
    };

    fetchAvatar();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId]);

  return avatarUrl;
  
  
}


export async function fetchUserProfilePicture(userId?: string): Promise<string | null> {
  const token = localStorage.getItem("token");
  try {
    const endpoint = userId 
      ? `/getPP?userId=${userId}&t=${Date.now()}` 
      : `/getPP?t=${Date.now()}`;

    const response = await api.get(endpoint, {
      responseType: "blob",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.status === 200 && response.data) {
      const blob = new Blob([response.data]);
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de la photo de profil :", err);
  }

  return null;
}

