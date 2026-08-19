import React, { useState, useEffect, useCallback } from "react";
import Pagination from "./paginationController";
import Rating from "./getRating";
import GameCard from "./gameCard";
import api from "../api/api";
import { Link } from "react-router-dom";

interface CommentItem {
  ID: number;
  CreatedAt: string;
  comment: string;
  comment_title: string;
  rating: number;
  user_id: string;
  game_id: number;
  author: string;
  title_1: string;
  title_2: string;
  profile_picture: string;
}

interface UserReviewsProps {
  userId?: string;
  className?: string;
}

function ReviewCard({ review, index }: { review: CommentItem; index: number }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{ name: string; header_image: string } | null>(null);

  useEffect(() => {
    let objectUrl = "";
    const fetchAvatar = async () => {
      const token = localStorage.getItem("token");
      try {
        const endpoint = `/getPP?userId=${review.user_id}&t=${Date.now()}`;
        const response = await api.get(endpoint, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.status === 200) {
          const blob = new Blob([response.data]);
          objectUrl = URL.createObjectURL(blob);
          setAvatarUrl(objectUrl);
        }
      } catch (err) {
        console.error("Erreur chargement avatar :", err);
      }
    };
    if (review.user_id) fetchAvatar();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [review.user_id]);

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const response = await api.get(`/game/${review.game_id}`);
        if (response.data) {
          setGameData({
            name: response.data.name || "Jeu",
            header_image: response.data.header_image || "",
          });
        }
      } catch (err) {
        console.error("Erreur chargement infos du jeu :", err);
      }
    };
    if (review.game_id) fetchGameInfo();
  }, [review.game_id]);

  const colors = ["bg-[#00509f]", "bg-[#3c9b71]", "bg-[#ed8a00]", "bg-[#fb4740]"];
  const color = colors[index % colors.length];
  const nickname = review.author || "Utilisateur";

  return (
    <>
      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden sm:flex w-[95%] h-[240px] flex-row items-center gap-3 my-2 shrink-0">
        <div className={`flex-1 h-full rounded-2xl p-4 shadow-md shadow-black/25 ${color} flex flex-col justify-between overflow-visible`}>
          <div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to={`/profil/${review.user_id}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={nickname} className="h-10 w-10 rounded-full object-cover shadow-sm border border-white/20" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-base font-bold text-white shrink-0">
                    {nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex flex-col text-left">
                <p className="font-bold text-gray-300 text-sm">{nickname}</p>
                <p className="text-[10px] font-semibold text-gray-300/75">
                  Posté le {new Date(review.CreatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="w-full font-extrabold text-base text-gray-200 mt-2 text-center shrink-0">
              {review.comment_title || "Avis sans titre"}
            </div>
            <div className="mt-2 text-xs bg-white/10 rounded-xl p-2.5 font-semibold whitespace-pre-wrap break-words text-gray-300 max-h-[75px] overflow-y-auto pr-1">
              {review.comment}
            </div>
          </div>
          <div className="shrink-0">
            <hr className="my-1.5 border-black/30" />
            <Rating rating={review.rating} className="justify-center scale-90" />
          </div>
        </div>

        <div className="w-[170px] h-[95%] flex items-center justify-center shrink-0 ml-3">
          {gameData ? (
            <GameCard id={review.game_id} name={gameData.name} tag="" imgLink={gameData.header_image} className="w-full h-full shadow-lg" />
          ) : (
            <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center text-xs text-gray-400">Chargement...</div>
          )}
        </div>
      </div>

      {/* ================= MOBILE VIEW (Refondu & Épuré) ================= */}
      <div className={`sm:hidden flex flex-col w-[95%] rounded-2xl p-4 shadow-md shadow-black/25 my-3 ${color} gap-3`}>
        {/* Top : Auteur + Date */}
        <div className="flex items-center justify-between">
          <Link to={`/profil/${review.user_id}`} className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt={nickname} className="h-8 w-8 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white shrink-0">
                {nickname.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="font-bold text-gray-200 text-xs truncate max-w-[140px]">{nickname}</p>
          </Link>
          <p className="text-[10px] text-gray-300/80">
            {new Date(review.CreatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Bloc central : Jeu + Titre & Note */}
        <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl">
          <div className="w-24 shrink-0 flex justify-center">
            {gameData ? (
              <div className="w-20 rounded-lg overflow-visible p-1 shadow">
                <GameCard id={review.game_id} name={gameData.name} tag="" imgLink={gameData.header_image} className="w-full h-auto" />
              </div>
            ) : (
              <div className="w-20 h-28 bg-white/10 rounded-lg animate-pulse" />
            )}
          </div>
          <div className="flex flex-col flex-1 text-left overflow-hidden">
            <p className="font-extrabold text-sm text-white truncate">{review.comment_title || "Avis sans titre"}</p>
            {gameData && <p className="text-[11px] text-gray-300/90 truncate mt-0.5">{gameData.name}</p>}
            <div className="mt-2">
              <Rating rating={review.rating} className="scale-75 origin-left" />
            </div>
          </div>
        </div>

        {/* Commentaire texte */}
        <div className="text-xs bg-white/10 rounded-xl p-3 font-medium whitespace-pre-wrap break-words text-gray-200 max-h-[130px] overflow-y-auto leading-relaxed">
          {review.comment}
        </div>
      </div>
    </>
  );
}

function UserReviews({ userId, className = "" }: UserReviewsProps) {
  const [reviews, setReviews] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUserReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page };
      if (userId) params.user = userId;
      const response = await api.get("/reviews", { params });
      setReviews(response.data.comments || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error("Erreur lors de la récupération des avis :", err);
      setError("Impossible de charger les avis pour le moment.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchUserReviews();
  }, [fetchUserReviews]);

  return (
    <>
      {/* VERSION DESKTOP */}
      <div className={`hidden sm:flex w-full h-[calc(100vh-280px)] min-h-[400px] flex-col rounded-2xl overflow-visible relative ${className}`}>
        <div className="w-full flex flex-col items-center h-[90%] overflow-y-auto p-2 rounded-t-2xl">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center text-red-400">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-gray-400">Aucun avis trouvé</div>
          ) : (
            reviews.map((review, index) => (
              <React.Fragment key={review.ID}>
                <ReviewCard review={review} index={index} />
                {index < reviews.length - 1 && (
                  <hr className="w-[85%] my-4 border-t border-white/15" />
                )}
              </React.Fragment>
            ))
          )}
        </div>
        <div className="relative z-20 flex h-[10%] min-h-[55px] w-full items-center justify-center gap-4 rounded-b-2xl bg-byellow px-4 backdrop-blur-md">
          <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>

      {/* VERSION MOBILE */}
      <div className={`sm:hidden flex flex-col w-full rounded-2xl overflow-visible relative ${className}`}>
        <div className="w-full flex flex-col items-center py-2 overflow-y-auto px-2">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="flex h-40 w-full items-center justify-center text-red-400">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center text-gray-400">Aucun avis trouvé</div>
          ) : (
            reviews.map((review, index) => (
              <React.Fragment key={review.ID}>
                <ReviewCard review={review} index={index} />
                {index < reviews.length - 1 && (
                  <hr className="w-[90%] my-3 border-t border-white/15" />
                )}
              </React.Fragment>
            ))
          )}
        </div>
        <div className="relative z-20 flex h-auto min-h-[55px] w-full items-center justify-center rounded-2xl bg-byellow px-4 py-2 mt-4 backdrop-blur-md">
          <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      </div>
    </>
  );
}

export default UserReviews;