import React, { useState, useEffect, useCallback } from "react";
import Pagination from "./paginationController";
import { Link } from "react-router-dom";

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

// ---------------------------------------------------------
// LISTE FICTIVE POUR LES TESTS (15 éléments pour tester la pagination)
// ---------------------------------------------------------
const MOCK_FRIENDS: FriendItem[] = [
  { id: "1", username: "PixelKnight", title_1: "DEV", title_2: "VETERAN" },
  { id: "2", username: "ShadowGamer", title_1: "NOOB", title_2: "CHILL" },
  { id: "3", username: "CyberSamuraï", title_1: "PRO", title_2: "SPEEDRUN" },
  { id: "4", username: "LuluDu92", title_1: "CASUAL", title_2: "STREAMER" },
  { id: "5", username: "NeonValkyrie", title_1: "HARDCORE", title_2: "ACHIEVER" },
  { id: "6", username: "RetroBoy", title_1: "RETRO", title_2: "COLLECTOR" },
  { id: "7", username: "AuraMage", title_1: "MAGE", title_2: "HEALER" },
  { id: "8", username: "Vortex", title_1: "TANK", title_2: "LEADER" },
  { id: "9", username: "ZeldaFan", title_1: "FAN", title_2: "EXPLORER" },
  { id: "10", username: "SonicFast", title_1: "PRO", title_2: "SPEED" },
  { id: "11", username: "NoxPlayer", title_1: "NIGHT", title_2: "GAMER" },
  { id: "12", username: "ApexPred", title_1: "ELITE", title_2: "HUNTER" },
  { id: "13", username: "ApexPred2", title_1: "ELITEe", title_2: "HUNTERr" },
  { id: "14", username: "Shadow2", title_1: "NOOB", title_2: "CHILL" },
  { id: "15", username: "Pixel2", title_1: "DEV", title_2: "VETERAN" },
];

const ITEMS_PER_PAGE = 12; // 3 lignes x 4 colonnes = 12 éléments par page sur desktop

// Couleurs de référence : [Bleu, Vert, Orange, Rouge]
const baseColors = ["bg-[#00509f]", "bg-[#3c9b71]", "bg-[#ed8a00]", "bg-[#fb4740]"];

function FriendCard({ friend, cardColor }: { friend: FriendItem; cardColor: string }) {
  const nickname = friend.username || "Utilisateur";

  return (
    <Link
      to={`/profil/${friend.id}`}
      className={`flex flex-col items-center balatro hover:z-100 justify-center p-3 rounded-2xl shadow-md shadow-black/25 ${cardColor} h-full w-full text-center gap-2 overflow-hidden hover:outline-3 hover:scale-[1.02] transition-all cursor-pointer`}
    >
      {/* Avatar rond centré */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gray-500 text-xl font-bold text-white border-2 border-white/30 shadow mx-auto">
          {nickname.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Nom */}
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

  // Simulation ou appel API de récupération des amis
  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const allFriends = MOCK_FRIENDS; 
      setFriends(allFriends);
      setTotalPages(Math.ceil(allFriends.length / ITEMS_PER_PAGE) || 1);
    } catch (err) {
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

  // Découpage de la liste selon la page active
  useEffect(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedFriends(friends.slice(startIndex, endIndex));
  }, [friends, page]);

  // Fonction pour alterner les couleurs par ligne (Ligne paire: 0->3, Ligne impaire: 3->0)
  const getCardColor = (index: number, itemsPerRow: number) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    let colorIndex = row % 2 === 0 ? col : itemsPerRow - 1 - col;
    colorIndex = colorIndex % baseColors.length;
    return baseColors[colorIndex];
  };

  return (
    <>
      {/* ================= VERSION DESKTOP (Grille fixe 4 colonnes x 3 lignes) ================= */}
      <div className={`hidden sm:flex w-full h-[calc(100vh-280px)] min-h-[400px] flex-col rounded-2xl relative ${className}`}>
        <div className="w-full h-[90%] p-3 rounded-t-2xl">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center text-red-400">{error}</div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400">Aucun ami trouvé</div>
          ) : (
            <div className="grid grid-cols-4 grid-rows-3 gap-3 h-full w-full">
              {paginatedFriends.map((friend, index) => {
                const cardColor = getCardColor(index, 4);
                return <FriendCard key={friend.id} friend={friend} cardColor={cardColor} />;
              })}
            </div>
          )}
        </div>

        {/* Footer pagination */}
        <div className="relative z-20 flex h-[10%] min-h-[55px] w-full items-center justify-center gap-4 rounded-b-2xl bg-byellow px-4 backdrop-blur-md">
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      </div>

      {/* ================= VERSION MOBILE (Liste en une seule colonne) ================= */}
      <div className={`sm:hidden flex flex-col w-full rounded-2xl relative ${className}`}>
        <div className="w-full py-2 px-3 flex flex-col gap-2 overflow-y-auto max-h-[65vh]">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="flex h-40 w-full items-center justify-center text-red-400">{error}</div>
          ) : paginatedFriends.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400">Aucun ami trouvé</div>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-sm font-bold text-white border-2 border-white/30 shadow shrink-0">
                    {nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-200 text-sm truncate">
                    {nickname}
                  </span>
                </Link>
              );
            })
          )}
        </div>
        <div className="relative z-20 flex h-auto min-h-[55px] w-full items-center justify-center rounded-b-2xl bg-byellow px-4 py-2 mt-2 backdrop-blur-md">
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onPageChange={(newPage) => setPage(newPage)} 
          />
        </div>
      </div>
    </>
  );
}

export default UserFriendsList;