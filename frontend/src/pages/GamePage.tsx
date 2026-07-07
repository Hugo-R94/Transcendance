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

const comments = [
	{
		UUID: 25,
		Nickname: "pedro",
		comment: "Un des meilleurs jeux coop auxquels j'ai joué depuis longtemps. Les combats sont nerveux, les bombardements sont aussi hilarants que dangereux, et chaque mission crée des moments mémorables avec les amis. Les développeurs ajoutent régulièrement du contenu, ce qui donne envie de revenir.",
		CommentTitle: "AGOUGOU",
		Likes: 89,
		Dislikes: 2,
	},
	{
		UUID: 234,
		Nickname: "Louis",
		comment: "L'idée est excellente, mais les serveurs et les bugs m'ont complètement gâché l'expérience. Les ennemis deviennent vite répétitifs et certaines armes semblent inutiles comparées à d'autres. J'espérais beaucoup mieux après tout le buzz.",
		CommentTitle: "Une critique politise du capitalisme a outrance.",
		Likes: 89,
		Dislikes: 2,
	},
	{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
	
	{
		UUID: 67,
		Nickname: "XX-Gamerz",
		comment: "C'est un jeu amusant, mais il ne plaira pas à tout le monde. Les mécaniques de stratagèmes sont originales, mais demandent une bonne coordination avec l'équipe. En solo, l'expérience est beaucoup moins intéressante. Si vous aimez les jeux coopératifs, ça vaut le détour.",
		CommentTitle: "Insecte",
		Likes: 89,
		Dislikes: 2,
	},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
		{
		UUID: 23,
		Nickname: "eliot",
		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
		CommentTitle: "JOUER DROLE",
		Likes: 89,
		Dislikes: 2,
},
	
	
];


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
        className="absolute -z-1 fixed object-cover  h-full w-full -top-15 m-auto mask-b-from-40% mask-b-to-70% sm:mask-l-from-85% sm:mask-l-to-95% sm:mask-r-from-85% mask-r-to-95%"
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
			<PostComment />
			<CommentSection comments={comments} gameID={game.appid} commentsPerPage={10} star={3.4} />
        </div>

        <NavBar />
      </div>
    </div>
  );
}

export default GamePage;

