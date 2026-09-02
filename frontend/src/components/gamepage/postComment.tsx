import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import StarRating from "./star";
import Notification from "../utils/notification";
import { postComment } from "../../api/comments";
import { fetchUserProfilePicture } from "../../api/getUserAvatar";

interface PostCommentProps {
    gameId: number;
    onCommentPosted?: () => void;
}

function PostComment({ gameId, onCommentPosted }: PostCommentProps) {
    const { t } = useTranslation();
    const [comment, setComment] = useState("");
    const [title, setTitle] = useState("");
    const [rating, setRating] = useState(0);
    const [ppURL, setPpURL] = useState<string | null>(null);
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let objectUrl = "";

        const loadAvatar = async () => {
            try {
                const url = await fetchUserProfilePicture();

                if (url) {
                    objectUrl = url;
                    setPpURL(url);
                }
            } catch (err) {
                console.error("Erreur fetch avatar:", err);
            }
        };

        loadAvatar();

        return () => {
            if (objectUrl && objectUrl.startsWith("blob:")) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, []);

    const handlePostComment = async () => {
        if (isSubmitting) {
            return;
        }

        if (!gameId || gameId === 0) {
            setNotificationMessage(t("postComment.errors.missingGameId"));
            return;
        }

        if (!title.trim()) {
            setNotificationMessage(t("postComment.errors.missingTitle"));
            return;
        }

        if (!comment.trim()) {
            setNotificationMessage(t("postComment.errors.missingComment"));
            return;
        }

        if (rating <= 0) {
            setNotificationMessage(t("postComment.errors.missingRating"));
            return;
        }

        setIsSubmitting(true);

        try {
            await postComment({
                game_id: gameId,
                comment: comment.trim(),
                comment_title: title.trim(),
                rating,
            });

            setComment("");
            setTitle("");
            setRating(0);

            setNotificationMessage(t("postComment.success"));

            if (onCommentPosted) {
                onCommentPosted();
            }
        } catch (error: any) {
            console.error("Error posting comment:", error);

            setNotificationMessage(
                error?.response?.data?.error ||
                error?.message ||
                t("postComment.errors.submitFailed")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-black/40 w-full h-fit mt-5 rounded-2xl p-5 backdrop-blur-md">
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    onClose={() => setNotificationMessage(null)}
                />
            )}

            <div className="w-full h-15 flex items-center gap-3">
                <div className="bg-gray-400 w-15 h-15 rounded-full overflow-hidden flex items-center justify-center">
                    {ppURL ? (
                        <img
                            src={ppURL}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-500 animate-pulse" />
                    )}
                </div>

                <p className="font-bold">
                    {t("postComment.prompt")}
                </p>
            </div>

            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-200 w-[75%] h-10 mt-3 rounded-2xl text-gray-800 p-2 resize-none overflow-y-auto focus:outline-none mx-auto block"
                placeholder={t("postComment.titlePlaceholder")}
            />

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-50 my-3 rounded-2xl bg-gray-200 text-gray-800 p-3 resize-none overflow-y-auto focus:outline-none mx-auto block"
                placeholder={t("postComment.commentPlaceholder")}
            />

            <StarRating
                className="justify-center"
                rating={rating}
                onChange={(note) => setRating(note)}
            />

            <button
                onClick={handlePostComment}
                disabled={isSubmitting}
                className="bg-[#00509f] w-30 h-15 mt-3 rounded-2xl balatro shadow-md shadow-black font-bold active:scale-90 hover:outline-2 hover:outline-white block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? t("postComment.submitting") : t("postComment.submit")}
            </button>
        </div>
    );
}

export default PostComment;