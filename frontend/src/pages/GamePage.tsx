import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGameInfo, getGameRatingStats } from "../api/game";
import type { GameInfo, GameRatingStats } from "../api/client";
import GameCard from "../components/gameCard";
import GameDescription from "../components/gameDescription";
import PostComment from "../components/postComment";
import CommentSection from "../components/commentSection";
import Rating from "../components/getRating";
import Tooltip from "../components/tooltip";

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
              <Rating rating={game.steam_score} />

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
			
            <div className="flex  bg-white/2	0 rounded-xl h-10 items-justify overflow-visible items-center xl:h-12 w-full my-1" >
				
				<div className="flex relative group  p-2 h-full aspect-[1/1] active:scale-90 overflow-visible  mx-auto justify-center items-center ">
					<Tooltip>J'aime ce jeu</Tooltip>
					<svg className="object-fit balatro" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  >
					<path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
					</svg>
				</div>
				
				<div className="flex  relative group p-2 h-full aspect-[1/1] active:scale-90 overflow-visible  mx-auto justify-center items-center ">
					<Tooltip>Je veux jouer a ce jeu</Tooltip>
					<svg className="currentColor stroke-width-1.5 stroke-white fill-white object-fit balatro" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 107.21"><title>add-to-wishlist</title><path d="M73.13,93.77,59.58,107.21,44,92.19c-2.43-2.35-5.25-4.92-8.18-7.59C19.93,70.14.79,52.69,0,31.09l0-1.65A28.51,28.51,0,0,1,9,8.54,31.68,31.68,0,0,1,29.57.31l1.71,0c13.72.18,20,6.2,28.18,14.24C66.21,7.38,71.81,1.52,83.21.21a33.07,33.07,0,0,1,18.62,3.37,34.41,34.41,0,0,1,12.24,10.25,31,31,0,0,1,6,14.86A30.55,30.55,0,0,1,116.82,46c-.41.8-.88,1.65-1.39,2.52l-.45.74A30.65,30.65,0,0,1,73.13,93.77Zm15.22-35.6a3.69,3.69,0,0,1,.3-1.48l0-.06a3.8,3.8,0,0,1,2.06-2,3.94,3.94,0,0,1,1.47-.31h0a3.87,3.87,0,0,1,1.48.29,4.15,4.15,0,0,1,1.26.84,3.87,3.87,0,0,1,.84,1.25l0,.07a4,4,0,0,1,.28,1.4v7.78h7.75a3.87,3.87,0,0,1,1.48.29,3.92,3.92,0,0,1,1.26.84,4,4,0,0,1,.84,1.25l0,.07a3.78,3.78,0,0,1,.28,1.35v.15a3.86,3.86,0,0,1-.29,1.41,4.15,4.15,0,0,1-.84,1.26,3.7,3.7,0,0,1-1.25.83l-.07,0a4,4,0,0,1-1.39.28H96.12v7.75a3.87,3.87,0,0,1-.3,1.48A3.92,3.92,0,0,1,95,84.17l-.08.07a3.72,3.72,0,0,1-1.17.77l-.07,0a3.8,3.8,0,0,1-1.4.28h0a4.07,4.07,0,0,1-1.48-.3,3.85,3.85,0,0,1-2.09-2.08,3.79,3.79,0,0,1-.3-1.47V73.69H80.6a3.87,3.87,0,0,1-1.48-.3l-.06,0a3.58,3.58,0,0,1-1.2-.81A3.87,3.87,0,0,1,77,71.3l0-.07a4,4,0,0,1-.28-1.4v0A4,4,0,0,1,77,68.33a3.86,3.86,0,0,1,.84-1.27,4,4,0,0,1,1.25-.83,3.71,3.71,0,0,1,1.47-.3h7.78V58.17Zm21.7-13.31c.34-.58.67-1.17,1-1.76a24.13,24.13,0,0,0,2.56-13.67,24.39,24.39,0,0,0-4.72-11.73,27.78,27.78,0,0,0-9.92-8.31A26.62,26.62,0,0,0,84,6.68c-9.13,1-14,6.2-19.9,12.47l-4.43,4.64L55.2,19.45c-7.27-7.14-12.74-12.52-24-12.67l-1.4,0a25.21,25.21,0,0,0-16.36,6.5A22.12,22.12,0,0,0,6.49,29.52l0,1.34c.67,18.85,18.72,35.3,33.67,48.93,2.89,2.63,5.67,5.16,8.32,7.72l11,10.61,9-8.91a30.66,30.66,0,0,1,41.55-44.35Zm-.76,7.87a24.14,24.14,0,1,0,7.07,17.07,24.06,24.06,0,0,0-7.07-17.07Z"/></svg>
				</div>
				
				<div className="flex relative group p-2 h-full aspect-[1/1] active:scale-90 overflow-visible  mx-auto justify-center items-center ">
					<Tooltip className="">J'aime pas ce jeu</Tooltip>
					<svg className="object-fit balatro" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
					<path stroke-linecap="round" stroke-linejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
					</svg>
				</div>
				
			</div>
			
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