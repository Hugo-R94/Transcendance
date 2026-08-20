import React, { useState, useEffect, useCallback } from "react";
import Pagination from "./paginationController";
import { Link } from "react-router-dom";
import type { Conversation } from "../api/chat";
import api from "../api/api";
import { useUserAvatar } from "../api/getUserAvatar"; // Assure-toi d'ajuster le chemin d'import selon l'emplacement de ton hook

interface FriendItem {
  id: string;
  username: string;
  title_1: string;
  title_2: string;
  profile_picture?: string;
}

interface UserFriendsListProps {
  userId?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 12; // 3 lignes x 4 colonnes = 12 éléments par page sur desktop

// Couleurs de référence : [Bleu, Vert, Orange, Rouge]
const baseColors = ["bg-[#00509f]", "bg-[#3c9b71]", "bg-[#ed8a00]", "bg-[#fb4740]"];

// Composant avatar desktop utilisant ton hook useUserAvatar
function FriendAvatar({ friendId, nickname }: { friendId: string; nickname: string }) {
  const avatarUrl = useUserAvatar(friendId);

  return (
    <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gray-500 text-xl font-bold text-white border-2 border-white/30 shadow mx-auto overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <span>{nickname.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// Composant avatar mobile utilisant ton hook useUserAvatar
function FriendAvatarMobile({ friendId, nickname }: { friendId: string; nickname: string }) {
  const avatarUrl = useUserAvatar(friendId);

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-sm font-bold text-white border-2 border-white/30 shadow shrink-0 overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <span>{nickname.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function FriendCard({ friend, cardColor }: { friend: FriendItem; cardColor: string }) {
  const nickname = friend.username || "Utilisateur";

  return (
    <Link
      to={`/profil/${friend.id}`}
      className={`flex flex-col items-center balatro hover:z-100 justify-center p-3 rounded-2xl shadow-md shadow-black/25 ${cardColor} h-full w-full text-center gap-2 overflow-hidden hover:outline-3 hover:scale-[1.02] transition-all cursor-pointer`}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <FriendAvatar friendId={friend.id} nickname={nickname} />
      </div>

      <span className="font-bold text-gray-200 text-xs sm:text-sm truncate w-full">
        {nickname}
      </span>
    </Link>
  );
}

function UserFriendsList({ userId, className = "" }: UserFriendsListProps) {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [paginatedFriends, setPaginatedFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const getOtherUser = (conv: Conversation, targetId: string) => {
    if (String(conv.user1_id) === String(targetId)) return conv.user2;
    if (String(conv.user2_id) === String(targetId)) return conv.user1;
    return null;
  };

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/convs");
      if (!Array.isArray(res.data?.conversations)) {
        setFriends([]);
        return;
      }

      const convs: Conversation[] = res.data.conversations;

      const extractedFriends: FriendItem[] = convs
        .filter((conv) => conv.accepted === true || conv.accepted === 1 || conv.accepted === "1" || conv.accepted === "true")
        .map((conv) => {
          const isUser1 = String(conv.user1_id) === String(userId);
          const isUser2 = String(conv.user2_id) === String(userId);
          
          if (!isUser1 && !isUser2) return null;

          const user = getOtherUser(conv, userId);
          if (!user) return null;

          return {
            id: user.id,
            username: user.username,
            title_1: user.title_1 || "",
            title_2: user.title_2 || "",
            profile_picture: user.profile_pic,
          };
        })
        .filter((f): f is FriendItem => f !== null);

      setFriends(extractedFriends);
      setTotalPages(Math.ceil(extractedFriends.length / ITEMS_PER_PAGE) || 1);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des amis :", err);
      setError("Impossible de charger les amis pour le moment.");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedFriends(friends.slice(startIndex, endIndex));
  }, [friends, page]);

  const getCardColor = (index: number, itemsPerRow: number) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    let colorIndex = row % 2 === 0 ? col : itemsPerRow - 1 - col;
    return baseColors[colorIndex % baseColors.length];
  };

  return (
    <>
      {/* ================= VERSION DESKTOP ================= */}
      <div className={`hidden sm:flex w-full h-[calc(100vh-280px)] min-h-[400px] flex-col rounded-2xl relative ${className}`}>
        <div className="w-full h-[90%] p-3 rounded-t-2xl">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400 font-bold">Chargement...</div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center text-red-400 font-bold">{error}</div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400 font-bold">Aucun ami trouvé</div>
          ) : (
            <div className="grid grid-cols-4 grid-rows-3 gap-3 h-full w-full">
              {paginatedFriends.map((friend, index) => (
                <FriendCard key={friend.id} friend={friend} cardColor={getCardColor(index, 4)} />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-20 flex h-[10%] min-h-[55px] w-full items-center justify-center gap-4 rounded-b-2xl bg-byellow px-4 backdrop-blur-md">
          <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>

      {/* ================= VERSION MOBILE ================= */}
      <div className={`sm:hidden flex flex-col w-full rounded-2xl relative ${className}`}>
        <div className="w-full py-2 px-3 flex flex-col gap-2 overflow-y-auto max-h-[65vh]">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400 font-bold">Chargement...</div>
          ) : error ? (
            <div className="flex h-40 w-full items-center justify-center text-red-400 font-bold">{error}</div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400 font-bold">Aucun ami trouvé</div>
          ) : (
            paginatedFriends.map((friend, index) => {
              const mobileColor = baseColors[index % baseColors.length];
              const nickname = friend.username || "Utilisateur";

              return (
                <Link
                  key={friend.id}
                  to={`/profil/${friend.id}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl shadow-md shadow-black/25 ${mobileColor} hover:opacity-90 transition-all cursor-pointer`}
                >
                  <FriendAvatarMobile friendId={friend.id} nickname={nickname} />
                  <span className="font-bold text-gray-200 text-sm truncate">{nickname}</span>
                </Link>
              );
            })
          )}
        </div>
        <div className="relative z-20 flex h-auto min-h-[55px] w-full items-center justify-center rounded-b-2xl bg-byellow px-4 py-2 mt-2 backdrop-blur-md">
          <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>
    </>
  );
}

export default UserFriendsList;