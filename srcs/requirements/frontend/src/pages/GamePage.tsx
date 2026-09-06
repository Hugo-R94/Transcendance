import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getGameInfo, getGameRatingStats } from "../api/game";
import type { GameInfo } from "../api/client";
import type { GameRatingStats } from "../api/game";

import GameCard from "../components/gamepage/gameCard";
import GameDescription from "../components/gamepage/gameDescription";
import PostComment from "../components/gamepage/postComment";
import CommentSection from "../components/gamepage/commentSection";
import Rating from "../components/gamepage/getRating";
import GameInteractionBar from "../components/gamepage/GameInteractionBar";

function GamePage() {
  const { t } = useTranslation();
  const { appid } = useParams();

  const [game, setGame] = useState<GameInfo | null>(null);

  const [stats, setStats] = useState<GameRatingStats>({
    average_rating: 0,
    total_reviews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentPosted = () => {
    setRefreshKey((prev) => prev + 1);

    if (appid) {
      getGameRatingStats(appid)
        .then(setStats)
    }
  };

  useEffect(() => {
    if (!appid) {
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getGameInfo(appid),
      getGameRatingStats(appid),
    ])
      .then(([gameData, statsData]) => {
        setGame(gameData);
        setStats(statsData);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setError(t("gamePage.notFound"));
        } else {
          setError(t("gamePage.genericError"));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appid]);

  if (loading) {
    return (
      <div className="p-10 text-white">
        {t("common.loading")}
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="p-10 text-white">
        {error ?? t("gamePage.notFound")}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white sm:flex sm:flex-col">

      <img
        src={game.background_image}
        alt={game.name}
        className="absolute -z-1 fixed -top-15 m-auto h-full w-full object-cover mask-b-from-40% mask-b-to-70% sm:mask-l-from-85% sm:mask-l-to-95% sm:mask-r-from-85% sm:mask-r-to-95%"
      />

      <div className="sm:fixed md:top-25 sm:top-0 sm:mt-0 mt-6 sm:h-screen h-auto sm:w-[18%] w-full z-20">

        {/* ================= DESKTOP ================= */}
        <div className="relative left-1/2 top-1/2 hidden w-[90%] max-w-[280px] -translate-x-1/2 -translate-y-1/2 flex-col items-center sm:flex">

          <div className="w-[75%] bg-white">
            <GameCard
              id={game.appid}
              name={game.name}
              imgLink={game.header_image}
              className="z-20 w-[85%] shadow-xl"
            />
          </div>

          <div className="card z-10 -mt-[10%] flex w-full flex-col justify-between rounded-2xl border border-white/5 bg-bdarkgreen p-3 pt-[14%] shadow-lg">

            <div className="flex w-full flex-col items-center justify-center py-1">

              <div className="flex h-10 w-full items-center justify-center gap-x-2">
                <p className="text-xs font-bold text-gray-300 xl:text-sm">
                  {t("gamePage.rating")}
                </p>

                <div className="flex h-full w-8 items-center justify-center p-1">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/3840px-Steam_icon_logo.svg.png"
                    alt={t("gamePage.steamLogoAlt")}
                    className="h-full object-contain"
                  />
                </div>
              </div>

              <Rating rating={game.steam_score} />

              <p className="text-[10px] text-gray-400">
                {t("gamePage.reviewCount", { count: game.total_reviews })}
              </p>
            </div>

            <hr className="mx-auto my-1.5 w-[90%] bg-gray-300/75" />

            <div className="flex w-full flex-col items-center justify-center gap-y-1 py-1">

              <div className="flex items-center justify-center gap-x-1.5">
                <p className="text-xs font-bold text-gray-300 xl:text-sm">
                  {t("gamePage.rating")}
                </p>

                <p className="rounded-xl bg-bblue px-2 py-1 text-xs shadow-md shadow-black/75 xl:text-sm">
                  <span className="font-bold text-white">
                    Click<span className="text-byellow">Bet</span>
                  </span>
                </p>
              </div>

              <Rating rating={Math.round(stats.average_rating)} />

              <p className="text-[10px] text-gray-400">
                {t("gamePage.reviewCount", { count: stats.total_reviews })}
              </p>
            </div>

            <hr className="mx-auto my-1.5 w-[90%] bg-gray-300/75" />

            <GameInteractionBar
              gameId={game.appid}
              initialState={game.list_state}
              className="my-1 flex h-10 w-full items-center justify-around overflow-visible rounded-xl bg-white/10 xl:h-12"
            />
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="mt-50 flex h-200 flex-col items-center gap-4 px-4 sm:hidden">

          <div className="w-[75%]">
            <GameCard
              id={game.appid}
              name={game.name}
              imgLink={game.header_image}
              className="z-1 w-2/3"
            />
          </div>

          <div className="card absolute w-[90%] translate-y-85 rounded-2xl border border-white/5 bg-bdarkgreen p-4 shadow-lg">

            <div className="mt-15 flex flex-col items-center">

              <div className="mb-3 flex h-15 w-full items-center justify-center gap-x-2">
                <p className="font-bold text-gray-300">
                  {t("gamePage.rating")}
                </p>

                <div className="h-full w-15 p-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/3840px-Steam_icon_logo.svg.png"
                    alt={t("gamePage.steamLogoAlt")}
                    className="h-full object-contain"
                  />
                </div>
              </div>

              <Rating rating={game.steam_score} />

              <p className="text-xs text-gray-400">
                {t("gamePage.reviewCount", { count: game.total_reviews })}
              </p>
            </div>

            <hr className="my-4 bg-gray-300/75" />

            <div className="flex flex-col items-center gap-y-2">

              <div className="flex items-center justify-center gap-x-2">
                <p className="font-bold text-gray-300">
                  {t("gamePage.rating")}
                </p>

                <p className="rounded-2xl bg-bblue p-2 shadow-md shadow-black/75">
                  <span className="font-bold text-white">
                    Click<span className="text-byellow">Bet</span>
                  </span>
                </p>
              </div>

              <Rating rating={Math.round(stats.average_rating)} />

              <p className="text-xs text-gray-400">
                {t("gamePage.reviewCount", { count: stats.total_reviews })}
              </p>
            </div>

            <hr className="my-4 bg-gray-300/75" />

            <GameInteractionBar
              gameId={game.appid}
              initialState={game.list_state}
              className="my-1 flex h-15 w-full items-center justify-around overflow-visible rounded-xl bg-white/10 xl:h-12"
            />
          </div>
        </div>
      </div>

      <div className="z-10 min-h-screen p-4 sm:mx-[20%] sm:w-3/5">
        <div className="h-fit -mt-10 flex flex-col rounded-xl sm:mt-100">

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