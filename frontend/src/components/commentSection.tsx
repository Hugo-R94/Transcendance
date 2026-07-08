import { useState, useMemo, useEffect } from "react";
import Comment from "./comment";
import PostComment from "./postComment";
import Pagination from "./paginationController";


const comments = [
// 	{
// 		UUID: 25,
// 		Nickname: "pedro",
// 		comment: "Un des meilleurs jeux coop auxquels j'ai joué depuis longtemps. Les combats sont nerveux, les bombardements sont aussi hilarants que dangereux, et chaque mission crée des moments mémorables avec les amis. Les développeurs ajoutent régulièrement du contenu, ce qui donne envie de revenir.",
// 		CommentTitle: "AGOUGOU",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 3,
// 	},
// 	{
// 		UUID: 234,
// 		Nickname: "Louis",
// 		comment: "L'idée est excellente, mais les serveurs et les bugs m'ont complètement gâché l'expérience. Les ennemis deviennent vite répétitifs et certaines armes semblent inutiles comparées à d'autres. J'espérais beaucoup mieux après tout le buzz.",
// 		CommentTitle: "Une critique politise du capitalisme a outrance.",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 4.5,
// 	},
// 	{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 5,
// },
	
// 	{
// 		UUID: 67,
// 		Nickname: "XX-Gamerz",
// 		comment: "C'est un jeu amusant, mais il ne plaira pas à tout le monde. Les mécaniques de stratagèmes sont originales, mais demandent une bonne coordination avec l'équipe. En solo, l'expérience est beaucoup moins intéressante. Si vous aimez les jeux coopératifs, ça vaut le détour.",
// 		CommentTitle: "Insecte",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.3,
// 	},
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.3,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.3,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.3,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.3,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2.5,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 2,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 3.5,
// },
// 		{
// 		UUID: 23,
// 		Nickname: "eliot",
// 		comment: "Très bon jeu, surtout en coopération. L'ambiance est incroyable et le gameplay est addictif. En revanche, la progression peut sembler un peu lente et certaines missions se ressemblent après plusieurs dizaines d'heures. Malgré ça, je continue d'y jouer régulièrement.",
// 		CommentTitle: "JOUER DROLE",
// 		Likes: 89,
// 		Dislikes: 2,
// 		rating: 3,
// },
	
	
];

export interface CommentData {
  UUID: number;
  Nickname: string;
  comment: string;
  CommentTitle: string;
  Likes: number;
  Dislikes: number;
}

interface CommentSectionProps {
  comments: CommentData[];
  gameID?: string | number;
  commentsPerPage?: number;
}

function CommentSection({
  gameID,
  commentsPerPage = 10,
}: CommentSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(comments.length / commentsPerPage));

  // Si la liste de commentaires change (nouveau jeu, etc.) et que la page
  // courante n'existe plus, on revient sur la première page.
  useEffect(() => {
    setCurrentPage(1);
  }, [gameID, comments.length]);

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * commentsPerPage;
    return comments.slice(start, start + commentsPerPage);
  }, [comments, currentPage, commentsPerPage]);

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    // Remonte en haut de la section commentaires au changement de page
    document
      .getElementById("comment-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="comment-section" className="flex flex-col gap-4">
      {/* Formulaire d'ajout de commentaire, toujours visible quelle que soit la page */}

      {comments.length === 0 ? (
        <div className="text-white/60 text-center py-10">
          Aucun commentaire pour le moment. Soyez le premier à donner votre avis !
        </div>
      ) : (
        <>
          {paginatedComments.map((comment, index) => (
            <Comment key={comment.UUID} UUID={comment.UUID}
              Nickname={comment.Nickname} comment={comment.comment}
              commentRowNb={(currentPage - 1) * commentsPerPage + index}
              CommentTitle={comment.CommentTitle}
              Likes={comment.Likes} Dislikes={comment.Dislikes} star = {comment.rating}
            />
          ))}

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default CommentSection;