import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Comment from "./comment";
import Pagination from "../utils/paginationController";
import { getComments } from "../../api/comments";


export interface CommentData {
  id: string;
  userID: string;
  Nickname: string;
  comment: string;
  comment_title: string;
  likes: number;
  dislikes: number;
  rating?: number;
  userVote?: number;
  title_1: string;
  title_2: string;
  profile_picture: string;
}

interface CommentSectionProps {
  gameID?: string | number;
  commentsPerPage?: number;
  currentUserId?: string | number;
  currentUsername?: string;
}

function CommentSection({
  gameID,
  commentsPerPage = 5,
  currentUserId = "",
  currentUsername,
}: CommentSectionProps) {
  const { t } = useTranslation();
  const resolvedUsername = currentUsername ?? t("commentSection.guest");
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const normalizedCurrentUserId = String(currentUserId || "");

  useEffect(() => {
    if (!gameID) return;

    const fetchComments = async () => {
      setLoading(true);

      try {
        const data = await getComments(gameID, currentPage, normalizedCurrentUserId);

        const formattedComments: CommentData[] = (data.comments || []).map(
          (item: any, index: number) => {
            const rawId = item.ID ?? item.id ?? item.CommentID ?? item.comment_id;

            const commentId = String(rawId ?? "");

            const authorUUID = String(
              item.author?.id ??
              item.author?.ID ??
              ""
            );

            return {
              id: commentId,
              userID: authorUUID,
              Nickname: item.author?.username ?? t("chat.defaultUsername"),
              comment: item.comment || "",
              comment_title: item.comment_title,
              likes: Number(item.likes ?? item.Likes ?? 0),
              dislikes: Number(item.dislikes ?? item.Dislikes ?? 0),
              rating: Number(item.rating ?? item.Rating ?? 0),
              userVote: Number(item.user_vote ?? item.userVote ?? 0),
              title_1: String(item.title_1 ?? item.title1 ?? item.Title1 ?? 9),
              title_2: String(item.title_2 ?? item.title2 ?? item.Title2 ?? 10),
              profile_picture: String(
                item.author?.profile_picture ??
                "avatars/avatar_default.png"
              ),

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
  }, [gameID, currentPage, commentsPerPage, normalizedCurrentUserId]);

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
          {t("commentSection.loading")}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-white/60 text-center py-10">
          {t("commentSection.empty")}
        </div>
      ) : (
        <>
          {comments.map((com, index) => {
            const savedVote = localStorage.getItem(`vote_${com.id}_${normalizedCurrentUserId}`);
            const effectiveVote =
              savedVote !== null ? Number(savedVote) : (com.userVote ?? 0);

            return (
              <Comment
                key={com.id || index}
                commentId={com.id}
                userId={normalizedCurrentUserId}
                UUID={com.userID}
                Nickname={com.Nickname}
                CommentTitle={com.comment_title}
                comment={com.comment}
                commentRowNb={(currentPage - 1) * commentsPerPage + index}
                Likes={com.likes}
                Dislikes={com.dislikes}
                star={com.rating ?? 0}
                initialUserVote={effectiveVote}
				        title1={com.title_1}
				        title2={com.title_2}
                profilPic={com.profile_picture}
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