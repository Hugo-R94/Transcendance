import { useEffect, useState } from "react";
import Comment from "./comment";
import Pagination from "./paginationController";
import { getComments } from "../api/comments";

export interface CommentData {
  id: number;
  userID: string; // 👈 Modifié : UUID sous forme de string
  Nickname: string;
  comment: string;
  CommentTitle: string;
  Likes: number;
  Dislikes: number;
  rating?: number;
  userVote?: number;
}

interface CommentSectionProps {
  gameID?: string | number;
  commentsPerPage?: number;
  currentUserId?: string | number; // 👈 Acceptation de l'UUID string
  currentUsername?: string;        // 👈 Ajout du username courant si besoin
}

function CommentSection({
  gameID,
  commentsPerPage = 5,
  currentUserId = "",
  currentUsername = "Invité",
}: CommentSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameID) return;

    const fetchComments = async () => {
      setLoading(true);

      try {
        const data = await getComments(gameID, currentPage, currentUserId);

        const formattedComments: CommentData[] = (data.comments || []).map(
          (item: any, index: number) => {
            const rawId = item.ID ?? item.id ?? item.CommentID ?? item.comment_id;
            const parsedId = Number(rawId);

            return {
              id: !isNaN(parsedId) && parsedId !== 0 ? parsedId : index + 1,
              // 👈 Récupération du userID (UUID) en string
              userID: String(item.userID ?? item.user_id ?? item.UserID ?? ""),
              Nickname:
                item.user?.nickname ||
                item.user?.username ||
                item.nickname ||
                item.username ||
                "Joueur anonyme",
              comment: item.comment || "",
              CommentTitle: item.commentTitle || item.CommentTitle || "",
              Likes: Number(item.likes ?? item.Likes ?? 0),
              Dislikes: Number(item.dislikes ?? item.Dislikes ?? 0),
              rating: Number(item.rating ?? item.Rating ?? 0),
              userVote: Number(item.user_vote ?? item.userVote ?? 0),
            };
          }
        );

        setComments(formattedComments);
        setTotalPages(
          Math.max(1, Math.ceil((data.total || formattedComments.length) / commentsPerPage))
        );
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [gameID, currentPage, commentsPerPage, currentUserId]);

  // Revenir à la page 1 si le jeu change
  useEffect(() => {
    setCurrentPage(1);
  }, [gameID]);

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);

    document.getElementById("comment-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div id="comment-section" className="flex flex-col gap-4">
      {loading ? (
        <div className="text-white/60 text-center py-10">
          Chargement des commentaires...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-white/60 text-center py-10">
          Aucun commentaire pour le moment. Soyez le premier à donner votre avis !
        </div>
      ) : (
        <>
          {comments.map((com, index) => {
            // Clé du cache local avec le userID/UUID
            const savedVote = localStorage.getItem(`vote_${com.id}_${currentUserId}`);
            const effectiveVote =
              savedVote !== null ? Number(savedVote) : (com.userVote ?? 0);

            return (
              <Comment
                key={com.id || index}
                commentId={com.id}
                userId={currentUserId} // Transmis aux props de Comment (UUID ou ID)
                UUID={com.userID}       // Transmet l'UUID du commentaire
                Nickname={com.Nickname}  // Transmet le nom d'utilisateur/pseudo
                CommentTitle={com.CommentTitle}
                comment={com.comment}
                commentRowNb={(currentPage - 1) * commentsPerPage + index}
                Likes={com.Likes}
                Dislikes={com.Dislikes}
                star={com.rating ?? 0}
                initialUserVote={effectiveVote}
              />
            );
          })}

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