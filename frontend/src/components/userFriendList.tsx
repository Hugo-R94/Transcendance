import { useState, useEffect, useCallback } from "react";
import Pagination from "./paginationController";
import DropdownMenu from "./dropdownFilter";
import { Link } from "react-router-dom";
import type { Conversation } from "../api/chat";
import api from "../api/api";
import { useUserAvatar } from "../api/getUserAvatar";

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

const listOptions = [
  { label: "Amis", value: "friends" },
  { label: "Bloqués", value: "blocked" },
];

const ITEMS_PER_PAGE = 12;
const baseColors = ["bg-[#00509f]", "bg-[#3c9b71]", "bg-[#ed8a00]", "bg-[#fb4740]"];

function FriendAvatar({ friendId, nickname, mobile = false }: { friendId: string; nickname: string; mobile?: boolean }) {
  const avatarUrl = useUserAvatar(friendId);

  return (
    <div className={`flex items-center justify-center rounded-full bg-gray-500 font-bold text-white border-2 border-white/30 shadow overflow-hidden ${mobile ? "h-10 w-10 text-sm shrink-0" : "h-16 w-16 sm:h-18 sm:w-18 text-xl mx-auto"}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <span>{nickname.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function FriendCard({
  friend,
  cardColor,
  showUnblock,
  onUnblock,
}: {
  friend: FriendItem;
  cardColor: string;
  showUnblock: boolean;
  onUnblock: (id: string) => void;
}) {
  const nickname = friend.username || "Utilisateur";

  return (
    <div className={`flex flex-col items-center balatro hover:z-100 justify-center p-3 rounded-2xl shadow-md shadow-black/25 ${cardColor} h-full w-full text-center gap-2 overflow-hidden hover:outline-3 hover:scale-[1.02] transition-all`}>
      <Link to={`/profil/${friend.id}`} className="flex-1 flex items-center justify-center w-full">
        <FriendAvatar friendId={friend.id} nickname={nickname} />
      </Link>

      {showUnblock && (
        <button
          type="button"
          onClick={() => onUnblock(friend.id)}
          className="bg-byellow w-1/2 rounded-2xl balatro h-8 hover:outline-3"
        >
          UNBLOCK
        </button>
      )}

      <span className="font-bold text-gray-200 text-xs sm:text-sm truncate w-full">{nickname}</span>
    </div>
  );
}

function UserFriendsList({ userId, className = "" }: UserFriendsListProps) {
  const [selectedList, setSelectedList] = useState("friends");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOtherUser = (conv: Conversation, targetId: string) => {
    if (String(conv.user1_id) === String(targetId)) return conv.user2;
    if (String(conv.user2_id) === String(targetId)) return conv.user1;
    return null;
  };

  const fetchFriends = useCallback(async () => {
    if (!userId) return [];

    const res = await api.get("/convs");
    const convs: Conversation[] = res.data?.conversations || [];

    return convs
      .filter(conv =>
        conv.accepted_1 === true && conv.accepted_2
      )
      .map(conv => { 
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
      .filter((user): user is FriendItem => user !== null);
  }, [userId]);

  const fetchBlocked = useCallback(async () => {
    const res = await api.get("/blocklist");
    const blocks = res.data?.block_list || [];

    return blocks
      .map((block: any) => {
        const user = block.BlockedUser || block.blocked_user || block.user;
        if (!user) return null;

        return {
          id: String(user.id),
          username: user.username || "Utilisateur",
          title_1: user.title_1 || "",
          title_2: user.title_2 || "",
          profile_picture: user.profile_pic || user.profile_picture,
        };
      })
      .filter((user: FriendItem | null): user is FriendItem => user !== null);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = selectedList === "friends"
        ? await fetchFriends()
        : await fetchBlocked();

      setFriends(list);
      setTotalPages(Math.ceil(list.length / ITEMS_PER_PAGE) || 1);
      setPage(1);
    } catch (err) {
      console.error("Erreur lors de la récupération de la liste :", err);
      setFriends([]);
      setTotalPages(1);
      setError(
        selectedList === "friends"
          ? "Impossible de charger les amis pour le moment."
          : "Impossible de charger la liste des utilisateurs bloqués."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedList, fetchFriends, fetchBlocked]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const paginatedFriends = friends.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleUnblock = async (id: string) => {
    try {
      await api.delete("/unblock", {
        data: { id },
      });

      await fetchList();
    } catch (err: any) {
      console.error(
        "Erreur lors du déblocage :",
        err.response?.data || err.message
      );
    }
  };

  const handleListChange = (value: string) => {
    setSelectedList(value);
    setPage(1);
  };

  const getCardColor = (index: number, itemsPerRow: number) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const colorIndex = row % 2 === 0 ? col : itemsPerRow - 1 - col;

    return baseColors[colorIndex % baseColors.length];
  };

  const emptyMessage = selectedList === "friends"
    ? "Aucun ami trouvé"
    : "Aucun utilisateur bloqué";

  return (
    <>
      {/* DESKTOP */}
      <div className={`hidden sm:flex w-full h-[calc(100vh-280px)] min-h-[400px] flex-col rounded-2xl relative ${className}`}>
        <div className="w-full h-[85%] p-3 rounded-t-2xl">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400 font-bold">
              Chargement...
            </div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center text-red-400 font-bold">
              {error}
            </div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400 font-bold">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid grid-cols-4 grid-rows-3 gap-3 h-full w-full">
              {paginatedFriends.map((friend, index) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  cardColor={getCardColor(index, 4)}
                  showUnblock={selectedList === "blocked"}
                  onUnblock={handleUnblock}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-20 flex h-20 min-h-[65px] w-full items-center justify-center gap-4 rounded-b-2xl bg-byellow px-4 backdrop-blur-md">
          <DropdownMenu
            pos={-1}
            items={listOptions}
            value={selectedList}
            onChange={handleListChange}
            color="bg-bgreen"
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* MOBILE */}
      <div className={`sm:hidden flex flex-col w-full rounded-2xl relative ${className}`}>
        <div className="relative flex items-center justify-center py-3 px-2 bg-byellow rounded-2xl mb-2">
          <DropdownMenu
            pos={-1}
            items={listOptions}
            value={selectedList}
            onChange={handleListChange}
            color="bg-bgreen"
          />
        </div>

        <div className="w-full py-2 px-3 flex flex-col gap-2 overflow-y-auto max-h-[65vh]">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400 font-bold">
              Chargement...
            </div>
          ) : error ? (
            <div className="flex h-40 w-full items-center justify-center text-red-400 font-bold">
              {error}
            </div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400 font-bold">
              {emptyMessage}
            </div>
          ) : (
            paginatedFriends.map((friend, index) => {
              const nickname = friend.username || "Utilisateur";

              return (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl shadow-md shadow-black/25 ${baseColors[index % baseColors.length]}`}
                >
                  <Link
                    to={`/profil/${friend.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FriendAvatar
                      friendId={friend.id}
                      nickname={nickname}
                      mobile
                    />

                    <span className="font-bold text-gray-200 text-sm truncate">
                      {nickname}
                    </span>
                  </Link>

                  {selectedList === "blocked" && (
                    <button
                      type="button"
                      onClick={() => handleUnblock(friend.id)}
                      className="bg-byellow px-3 h-8 rounded-xl balatro hover:outline-2 shrink-0"
                    >
                      Débloquer
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="relative z-20 flex h-auto min-h-[55px] w-full items-center justify-center rounded-b-2xl bg-byellow px-4 py-2 mt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}

export default UserFriendsList;