import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ShaderBackground from "../components/shaderBG";
import NavBar from "../components/navBar";
import StarRating from "../components/star";
import Comment from "../components/comment";
import { getGameInfo } from "../api/game";
import type { GameInfo } from "../api/client";
import GameCard from "../components/gameCard";
import GameDescription from "../components/gameDescription";
import PostComment from "../components/postComment";
import CommentSection from "../components/commentSection";



function GamePage() {
  const { appid } = useParams();
  const [game, setGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appid) return;

    setLoading(true);
    setError(null);

    getGameInfo(appid)
      .then((data) => setGame(data))
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
      <ShaderBackground />

      <img
        src={game.background_image}
        className="absolute -z-1 fixed object-cover  h-full w-full -top-15 m-auto mask-b-from-40% mask-b-to-70% sm:mask-l-from-85% sm:mask-l-to-95% sm:mask-r-from-85% sm:mask-r-to-95%"
      />

      <div className="sm:fixed sm:top-0 sm:w-[18%] w-full h-screen rounded-2xl">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 sm:w-[90%] w-2/3 aspect-[6/9]">
          <div className="absolute inset-0 rounded-2xl bg-[#334b4d] shadow-lg" />
		  <GameCard id={game.appid}  name={game.name} tag="Tags" imgLink={game.header_image} className="absolute inset-x-[20%] -top-[50%]"/>
        </div>
      </div>
	  
	  
      <div className="sm: sm:mx-[20%] min-h-screen sm:w-3/5 p-4 z-10">
        <div className="h-fit sm:mt-100 mt-0 rounded-xl flex flex-col">
			<GameDescription name={game.name} description={game.description} developer="devs" tag="tag1,tag2"/>
			<PostComment  gameId={game.appid}/>
			<CommentSection gameID={game.appid} commentsPerPage={10} star={3.4} />
        </div>

        <NavBar />
      </div>
    </div>
  );
}

export default GamePage;

