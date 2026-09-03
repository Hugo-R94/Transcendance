import { useEffect, useState } from "react";
import LikeButton from "./LikeButton";
import Rating from "./getRating";
import { getTitleLabel } from "../profile/titleManager";
import { Link } from "react-router-dom"; // <-- Ajouter cet import

type CommentProps = {
  commentId: number;
  userId: number | string;
  UUID: number | string; // UUID de l'auteur du commentaire
  Nickname: string;
  CommentTitle: string;
  comment: string;
  commentRowNb: number;
  Likes: number;
  Dislikes: number;
  star: number;
  initialUserVote?: number;
  title1: string;
  title2: string;
  profilPic: string;
};

function Comment({
  commentId,
  userId,
  UUID,
  Nickname,
  comment,
  commentRowNb,
  CommentTitle,
  Likes,
  Dislikes,
  star,
  initialUserVote = 0,
  title1,
  title2,
  profilPic,
}: CommentProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl = "";

    const fetchAvatar = async () => {
      const token = localStorage.getItem("token");

      try {
        // Option 1 : Si tu as une route spécifique avec l'UUID de l'auteur
        const endpoint = `http://localhost:8080/api/v1/getPP?userId=${UUID}&t=${Date.now()}`;
        
        const response = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setAvatarUrl(objectUrl);
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error("Erreur chargement avatar commentaire :", err);
        setAvatarUrl(null);
      }
    };

    if (profilPic || UUID) {
      fetchAvatar();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [profilPic, UUID]);

  const colors = [
    "bg-[#00509f]",
    "bg-[#3c9b71]",
    "bg-[#ed8a00]",
    "bg-[#fb4740]",
  ];

  const label1 = getTitleLabel(title1);
  const label2 = getTitleLabel(title2);
  const color = colors[commentRowNb % colors.length];
  const userLink = `http://localhost:8080/profil/${userId}`;
  return (
    <div className={`w-full rounded-2xl p-4 shadow-md shadow-black/20 my-3 ${color}`}>
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Link 
          to={`/profil/${UUID}`} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
        {/* AVATAR (BLOB OU FALLBACK INITIALE) */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={Nickname}
            className="h-12 w-12 rounded-full object-cover shadow-sm border border-white/20"
          />
         
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white shrink-0">
            {Nickname ? Nickname.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        </Link>
        <div>
          <p className="font-bold text-start text-gray-300">{Nickname}</p>
          <p className="text-xs text-start font-semibold text-gray-300/75">
            {label1} {label2}
          </p>
        </div>
      </div>

      {/* COMMENT TITLE & TEXT */}
      <div className="w-full h-fit font-extrabold text-xl text-gray-200 mt-3 flex text-center justify-center">
        {CommentTitle}
      </div>

      <div className="mt-3 text-sm bg-white/10 rounded-2xl p-3 font-semibold whitespace-pre-wrap break-words text-gray-300">
        {comment}
      </div>

      <hr className="my-3 border-black/30" />

      {/* RATING */}
      <Rating rating={star} className="my-3 justify-center" />
      {/* LIKE BUTTON */}
      <LikeButton
        commentId={commentId}
        userId={userId}
        initialLikes={Likes}
        initialDislikes={Dislikes}
        initialState={initialUserVote}
      />
    </div>
  );
}

export default Comment;