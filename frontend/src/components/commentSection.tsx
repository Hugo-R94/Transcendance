import { useEffect, useState } from "react";
import Comment from "./comment";
import Pagination from "./paginationController";

export interface CommentData {
  UUID: number;
  Nickname: string;
  comment: string;
  CommentTitle: string;
  Likes: number;
  Dislikes: number;
  rating?: number;
}

interface CommentSectionProps {
  gameID?: string | number;
  commentsPerPage?: number;
}

function CommentSection({
  gameID,
  commentsPerPage = 5,
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
		const response = await fetch(
		`http://localhost:8080/api/v1/comments/${gameID}/comments?page=${currentPage}`
		);
		
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();

        const formattedComments: CommentData[] = data.comments.map(
          (item: any) => ({
            UUID: item.ID,
            Nickname: `User ${item.userID}`,
            comment: item.comment,
            CommentTitle: item.commentTitle,
            Likes: item.likes,
            Dislikes: item.dislikes,
            rating: item.rating,
          })
        );

        setComments(formattedComments);

		setTotalPages(
		Math.max(1, Math.ceil(data.total / commentsPerPage))
		);

      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

  }, [gameID, currentPage, commentsPerPage]);


  useEffect(() => {
    setCurrentPage(1);
  }, [gameID]);


  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);

    setCurrentPage(clamped);

    document
      .getElementById("comment-section")
      ?.scrollIntoView({
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
         {comments.map((comment, index) => (
            <Comment
              key={comment.UUID}
              UUID={comment.UUID}
              Nickname={comment.Nickname}
              comment={comment.comment}
              commentRowNb={
                (currentPage - 1) * commentsPerPage + index
              }
              CommentTitle={comment.CommentTitle}
              Likes={comment.Likes}
              Dislikes={comment.Dislikes}
              star={comment.rating}
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