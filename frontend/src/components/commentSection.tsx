import { useState, useMemo, useEffect } from "react";
import Comment from "./comment";
import PostComment from "./postComment";
import Pagination from "./paginationController";

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
  comments,
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
              Likes={comment.Likes} Dislikes={comment.Dislikes} star = {3.4}
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