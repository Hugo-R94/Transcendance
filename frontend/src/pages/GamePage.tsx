import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ShaderBackground from "../components/shaderBG";
import NavBar from "../components/navBar";
// import StarRating from "../components/star"; // Non utilisé ici
// import Comment from "../components/comment"; // Non utilisé ici
import { getGameInfo } from "../api/game";
import type { GameInfo } from "../api/client";
import GameCard from "../components/gameCard";
import GameDescription from "../components/gameDescription";
import PostComment from "../components/postComment";
import CommentSection from "../components/commentSection";
import Grid from "../components/grid";



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

      {/* Barre latérale (sur grand écran) ou conteneur du haut (sur mobile) */}
      <div className="sm:fixed md:top-25 sm:top-0 sm:mt-0 mt-100 sm:w-[18%] w-full sm:h-screen h-150 rounded-2xl z-20 ">
        {/* Conteneur de référence positionné au centre de la zone de la barre latérale */}
        <div className="absolute left-1/2 sm:top-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-[90%] w-2/3 aspect-[6/9]">
          
          {/* 1. La "Carte de Fond" (le rectangle sombre) */}
          <div className="absolute inset-0 rounded-2xl bg-[#334b4d] shadow-lg" />
          
          {/* 2. La "GameCard" (le poster du jeu) */}
          {/* Explication des classes de positionnement :
              - absolute : pour pouvoir la décaler par rapport au conteneur de référence.
              - left-1/2 -translate-x-1/2 : centre horizontalement la carte par rapport au conteneur de référence.
              - -top-[40%] : remonte la carte verticalement pour créer le chevauchement. Réglez ce % selon vos goûts.
              - w-[80%] : définit la largeur de la GameCard par rapport à son parent.
              - z-10 : s'assure qu'elle passe au-dessus du fond sombre.
          */}
          <GameCard 
            id={game.appid}  
            name={game.name} 
            tag="Tags" 
            imgLink={game.header_image} 
            className="absolute left-1/2 -translate-x-1/2 -top-[40%] w-[80%] z-10"
          />
        </div>
      </div>
      
      
      <div className="sm:mx-[20%] min-h-screen sm:w-3/5 p-4 z-10">
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