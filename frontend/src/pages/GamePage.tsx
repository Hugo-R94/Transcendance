import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameInfo, getGameRatingStats } from "../api/game";
import type { GameInfo, GameRatingStats } from "../api/client";
import GameCard from "../components/gameCard";
import GameDescription from "../components/gameDescription";
import PostComment from "../components/postComment";
import CommentSection from "../components/commentSection";
import Rating from "../components/getRating";

function GamePage() {
  const { appid } = useParams();
  const [game, setGame] = useState<GameInfo | null>(null);
  const [stats, setStats] = useState<GameRatingStats>({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour forcer le rechargement de la section des commentaires et des stats
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleCommentPosted = () => {
    // Déclenche le rechargement du composant CommentSection
    setRefreshKey((prev) => prev + 1);

    // Recharge les statistiques de note moyenne du jeu
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
      <img
        src={game.background_image}
        className="absolute -z-1 fixed object-cover h-full w-full -top-15 m-auto mask-b-from-40% mask-b-to-70% sm:mask-l-from-85% sm:mask-l-to-95% sm:mask-r-from-85% sm:mask-r-to-95%"
        alt={game.name}
      />
      {/* Barre latérale (Desktop) / En-tête (Mobile) */}
      <div className="sm:fixed md:top-25 sm:top-0 sm:mt-0 mt-6 sm:w-[18%] w-full sm:h-screen h-auto z-20">
        {/* Vue Desktop */}
        <div className="hidden sm:flex relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:w-[90%] max-w-[280px] flex-col items-center">
          <GameCard
            id={game.appid}
            name={game.name}
            imgLink={game.header_image}
            className="w-[85%] z-20 shadow-xl"
          />

          {/* Carte de Notes */}
          <div className="w-full -mt-[10%] rounded-2xl bg-bdarkgreen p-3 pt-[14%] shadow-lg card flex flex-col justify-between z-10 border border-white/5">
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
              <Rating rating={game.steam_score-0.05} />
			  <p className="text-[10px] text-gray-400"> {game.total_reviews} avis</p>
            </div>

            <hr className="bg-gray-300/75 my-1.5 w-[90%] mx-auto" />

            <div className="flex flex-col justify-center items-center w-full py-1 gap-y-1">
              <div className="flex justify-center items-center gap-x-1.5">
                <p className="font-bold text-gray-300 text-xs xl:text-sm">note</p>
                <p className="bg-bblue px-2 py-1 rounded-xl shadow-black/75 shadow-md text-xs xl:text-sm">
                  <span className="font-bold text-white">Click<span className="text-byellow">Bet</span></span>
                </p>
              </div>
              <Rating rating={Math.round(stats.average_rating)} />
              <p className="text-[10px] text-gray-400">
                {stats.total_reviews} {stats.total_reviews > 1 ? "avis" : "avis"}
              </p>
            </div>

            <hr className="bg-gray-300/75 my-2 w-[90%] mx-auto" />
            <div className="bg-white/10 rounded-xl h-10 xl:h-12 w-full my-1" />
            <hr className="bg-gray-300/75 my-1.5 w-[90%] mx-auto" />
            <div className="bg-white/10 rounded-xl h-10 xl:h-12 w-full my-1" />
          </div>
        </div>

        {/* Vue Mobile */}
        <div className="sm:hidden flex flex-col items-center gap-4 px-4 mt-50 h-225">
          <GameCard
            id={game.appid}
            name={game.name}
            imgLink={game.header_image}
            className="w-2/3 z-1" 
          />

          <div className="absolute w-[90%] h-125 rounded-2xl bg-bdarkgreen p-4 shadow-lg card translate-y-85">
            <div className="flex flex-col items-center mt-15">
              <div className="w-full h-15 mb-3 flex justify-center items-center gap-x-2">
                <p className="font-bold text-gray-300">note </p>
                <div className="w-15 h-full p-2">
                  <img className="h-full" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/3840px-Steam_icon_logo.svg.png" alt="Steam" />
                </div>
              </div>
              <Rating rating={5} />
            </div>

            <hr className="bg-gray-300/75 my-4" />

            <div className="flex flex-col gap-y-2 items-center">
              <div className="flex justify-center items-center gap-x-2">
                <p className="font-bold text-gray-300">note </p>
                <p className="bg-bblue p-2 rounded-2xl shadow-black/75 shadow-md">
                  <span className="font-bold text-white">Click<span className="text-byellow">Bet</span></span>
                </p>
              </div>
            
              <Rating rating={Math.round(stats.average_rating)} />
              <p className="text-xs text-gray-400">{stats.total_reviews} avis</p>
            </div>

            <hr className="bg-gray-300/75 my-4" />
            <div className="h-15 bg-white rounded-xl" />
            <hr className="bg-gray-300/75 my-4" />
            <div className="h-15 bg-white rounded-xl" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="sm:mx-[20%] min-h-screen sm:w-3/5 p-4 z-10">
        <div className="h-fit sm:mt-100 -mt-10 rounded-xl flex flex-col">
            <GameDescription name={game.name} releaseDate={game.release_date} description={game.description}  developers={game.developers} publishers={game.publishers} genres={game.genres}/>
            
            {/* Formulaire de publication de commentaire avec callback de rafraîchissement */}
            <PostComment gameId={game.appid} onCommentPosted={handleCommentPosted} />
            
            {/* Section des commentaires synchronisée avec refreshKey */}
            <CommentSection key={refreshKey} gameID={game.appid} commentsPerPage={10} />
        </div>
      </div>
    </div>
  );
}

export default GamePage;