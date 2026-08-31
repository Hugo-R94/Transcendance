import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Pagination from "../utils/paginationController";
import api from "../../api/api";
import { useUserAvatar } from "../../api/getUserAvatar";

interface BlockedUser {
  id: string;
  username: string;
  profile_pic?: string;
}

interface Props {
  className?: string;
}

const ITEMS_PER_PAGE = 12;
const COLORS = ["bg-[#00509f]", "bg-[#3c9b71]", "bg-[#ed8a00]", "bg-[#fb4740]"];

function Avatar({ user, mobile = false }: { user: BlockedUser; mobile?: boolean }) {
  const avatarUrl = useUserAvatar(user.id);

  return (
    <div className={`${mobile ? "h-10 w-10 text-sm" : "h-16 w-16 text-xl"} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-gray-500 font-bold text-white shadow`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={user.username} className="h-full w-full object-cover" />
      ) : (
        user.username.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export default function UserBlockList({ className = "" }: Props) {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchBlockList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/blocklist");

      const blocked = res.data?.block_list ?? [];

      setUsers(
        blocked.map((block: any) => {
          /*
           * Si ton backend retourne :
           *
           * {
           *   user_id: "...",
           *   blocked_user: {
           *      id: "...",
           *      username: "..."
           *   }
           * }
           *
           * on récupère blocked_user.
           */
          const user = block.blocked_user ?? block.BlockedUser;

          return {
            id: String(user?.id ?? block.blocked_user_id ?? block.BlockedUserID),
            username: user?.username ?? "Utilisateur",
            profile_pic: user?.profile_pic,
          };
        })
      );

      setPage(1);
    } catch (error) {
      console.error("Erreur blocklist :", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockList();
  }, [fetchBlockList]);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE) || 1;
  const displayed = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div className="hidden h-[calc(100vh-345px)] min-h-[400px] p-3 sm:block">
        {loading ? (
          <Message text="Chargement..." />
        ) : displayed.length === 0 ? (
          <Message text="Aucun utilisateur bloqué" />
        ) : (
          <div className="grid h-full w-full grid-cols-4 grid-rows-3 gap-3">
            {displayed.map((user, index) => (
              <Link
                key={user.id}
                to={`/profil/${user.id}`}
                className={`balatro flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center shadow-md shadow-black/25 transition-all hover:scale-[1.02] hover:outline-3 ${COLORS[index % COLORS.length]}`}
              >
                <Avatar user={user} />

                <span className="w-full truncate text-sm font-bold text-gray-200">
                  {user.username}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3 sm:hidden">
        {loading ? (
          <Message text="Chargement..." />
        ) : displayed.length === 0 ? (
          <Message text="Aucun utilisateur bloqué" />
        ) : (
          displayed.map((user, index) => (
            <Link
              key={user.id}
              to={`/profil/${user.id}`}
              className={`flex items-center gap-3 rounded-2xl p-3 ${COLORS[index % COLORS.length]}`}
            >
              <Avatar user={user} mobile />

              <span className="truncate text-sm font-bold text-gray-200">
                {user.username}
              </span>
            </Link>
          ))
        )}
      </div>

      <div className="flex min-h-[55px] items-center justify-center rounded-2xl bg-byellow px-4 py-2">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center font-bold text-gray-400">
      {text}
    </div>
  );
}