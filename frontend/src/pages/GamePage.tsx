import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameInfo, getGameRatingStats } from "../api/game";
import type { GameInfo, GameRatingStats } from "../api/client";
import GameCard from "../components/gameCard";
import GameDescription from "../components/gameDescription";
import PostComment from "../components/postComment";
import CommentSection from "../components/commentSection";
import Rating from "../components/getRating";
import GameInteractionBar from "../components/GameInteractionBar";

function GamePage() {
  const { appid } = useParams();
  const [game, setGame] = useState<GameInfo | null>(null);
  const [stats, setStats] = useState<GameRatingStats>({
    average_rating: 0,
    total_reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rechargement des avis et statistiques lors d'un nouveau commentaire
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleCommentPosted = () => {
    setRefreshKey((prev) => prev + 1);
    if (appid) {
      getGameRatingStats(appid).then(setStats).catch(console.error);
    }
  };

  useEffect(() => {
    if (!appid) return;

    setLoading(true);
    setError(null);

    Promise.all([getGameInfo(appid), getGameRatingStats(appid)])
      .then(([gameData, statsData]) => {
        setGame(gameData);
        setStats(statsData);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setError("Jeu introuvable");
        } else {
          setError("Une erreur est survenue");
        }
      })
      .finally(() => setLoading(false));
  }, [appid]);

  if (loading) {
    return <div className="text-white p-10">Chargement...</div>;
  }

  if (error || !game) {
    return <div className="text-white p-10">{error ?? "Game not found"}</div>;
  }

  return (
    <div className="min-h-screen text-white sm:flex sm:flex-col">
      {/* Background Image */}
      <img
        src={game.background_image}
        className="absolute -z-1 fixed object-cover h-full w-full -top-15 m-auto mask-b-from-40% mask-b-to-70% sm:mask-l-from-85% sm:mask-l-to-95% sm:mask-r-from-85% sm:mask-r-to-95%"
        alt={game.name}
      />

      {/* Barre latérale (Desktop) / En-tête (Mobile) */}
      <div className="sm:fixed md:top-25 sm:top-0 sm:mt-0 mt-6 sm:w-[18%] w-full sm:h-screen h-auto z-20">
        
        {/* --- VUE DESKTOP --- */}
        <div className="hidden sm:flex relative left-1/2  top-1/2 -translate-x-1/2 -translate-y-1/2 sm:w-[90%] max-w-[280px] flex-col items-center">
        <div className="bg-white w-[75%]">
          <GameCard
            id={game.appid}
            name={game.name}
            imgLink={game.header_image}
            className="w-[85%] z-20 shadow-xl"
          />
          </div>
          <div className="w-full -mt-[10%] rounded-2xl bg-bdarkgreen p-3 pt-[14%] shadow-lg card flex flex-col justify-between z-10 border border-white/5">
            {/* Note Steam */}
            <div className="flex flex-col justify-center items-center w-full py-1">
              <div className="w-full h-10 flex justify-center items-center gap-x-2">
                <p className="font-bold text-gray-300 text-xs xl:text-sm">note</p>
                <div className="w-8 h-full p-1 flex items-center justify-center">
                  <img
                    className="h-full object-contain"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/3840px-Steam_icon_logo.svg.png"
                    alt="Steam Logo"
                  />
                </div>
              </div>
              <Rating rating={game.steam_score} />
              <p className="text-[10px] text-gray-400">{game.total_reviews} avis</p>
            </div>

            <hr className="bg-gray-300/75 my-1.5 w-[90%] mx-auto" />

            {/* Note ClickBet */}
            <div className="flex flex-col justify-center items-center w-full py-1 gap-y-1">
              <div className="flex justify-center items-center gap-x-1.5">
                <p className="font-bold text-gray-300 text-xs xl:text-sm">note</p>
                <p className="bg-bblue px-2 py-1 rounded-xl shadow-black/75 shadow-md text-xs xl:text-sm">
                  <span className="font-bold text-white">
                    Click<span className="text-byellow">Bet</span>
                  </span>
                </p>
              </div>
              <Rating rating={Math.round(stats.average_rating)} />
              <p className="text-[10px] text-gray-400">
                {stats.total_reviews} avis
              </p>
            </div>

            <hr className="bg-gray-300/75 my-1.5 w-[90%] mx-auto" />

            {/* Barre d'interaction */}
            <GameInteractionBar
              gameId={game.appid}
              initialState={game.list_state}
              className="flex bg-white/10 rounded-xl h-10 xl:h-12 w-full my-1 items-center justify-around overflow-visible"
            />
          </div>
        </div>

        {/* --- VUE MOBILE --- */}
        <div className="sm:hidden flex flex-col items-center gap-4 px-4 mt-50 h-200">
          <div className="w-[75%]">
          <GameCard
            id={game.appid}
            name={game.name}
            imgLink={game.header_image}
            className="w-2/3 z-1"
          />
          </div>
          <div className="absolute w-[90%] rounded-2xl bg-bdarkgreen p-4 shadow-lg card translate-y-85 border border-white/5">
            {/* Note Steam */}
            <div className="flex flex-col items-center mt-15">
              <div className="w-full h-15 mb-3 flex justify-center items-center gap-x-2">
                <p className="font-bold text-gray-300">note</p>
                <div className="w-15 h-full p-2">
                  <img
                    className="h-full object-contain"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/3840px-Steam_icon_logo.svg.png"
                    alt="Steam Logo"
                  />
                </div>
              </div>
              <Rating rating={game.steam_score} />
              <p className="text-xs text-gray-400">{game.total_reviews} avis</p>
            </div>

            <hr className="bg-gray-300/75 my-4" />

            {/* Note ClickBet */}
            <div className="flex flex-col gap-y-2 items-center">
              <div className="flex justify-center items-center gap-x-2">
                <p className="font-bold text-gray-300">note</p>
                <p className="bg-bblue p-2 rounded-2xl shadow-black/75 shadow-md">
                  <span className="font-bold text-white">
                    Click<span className="text-byellow">Bet</span>
                  </span>
                </p>
              </div>

              <Rating rating={Math.round(stats.average_rating)} />
              <p className="text-xs text-gray-400">{stats.total_reviews} avis</p>
            </div>

            <hr className="bg-gray-300/75 my-4" />

            {/* Barre d'interaction */}
            <GameInteractionBar
              gameId={game.appid}
              initialState={game.list_state}
              className="flex bg-white/10 rounded-xl h-15 xl:h-12 w-full my-1 items-center justify-around overflow-visible"
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="sm:mx-[20%] min-h-screen sm:w-3/5 p-4 z-10">
        <div className="h-fit sm:mt-100 -mt-10 rounded-xl flex flex-col">
          <GameDescription
            name={game.name}
            releaseDate={game.release_date}
            description={game.description}
            developers={game.developers}
            publishers={game.publishers}
            genres={game.genres}
          />

          <PostComment
            gameId={game.appid}
            onCommentPosted={handleCommentPosted}
          />

          <CommentSection
            key={refreshKey}
            gameID={game.appid}
            commentsPerPage={10}
          />
        </div>
      </div>
    </div>
  );
}

export default GamePage;