import { useState } from "react";
import LikeButton from "./LikeButton";
import StarRating from "./star";
import Rating from "./getRating";

type CommentProps = {
  UUID: number;
  Nickname: string;
  CommentTitle: string;
  comment: string;
  commentRowNb: number;
  Likes: number;
  Dislikes: number;
  star: number;
  
};

function Comment({
  UUID,
  Nickname,
  comment,
  commentRowNb,
  CommentTitle,
  Likes,
  Dislikes,
  star,
}: CommentProps) {
  const colors = [
    "bg-[#00509f]",
    "bg-[#3c9b71]",
    "bg-[#ed8a00]",
    "bg-[#fb4740]",
  ];

  const color = colors[commentRowNb % 4];

  // 🔥 STATE DU LIKE
  const [state, setState] = useState<number>(0);

  const handleLike = () => {
    setState((prev) => (prev === 1 ? 0 : 1));
  };

  const handleDislike = () => {
    setState((prev) => (prev === -1 ? 0 : -1));
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 shadow-md shadow-black/20 my-3 ${color} $(classname)`}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white">
          {Nickname.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-bold text-left text-gray-300">{Nickname}</p>
          <p className="text-xs text-left font-semibold text-gray-300/75">
            {CommentTitle}
          </p>
        </div>
      </div>

      {/* COMMENT */}
      <div className="mt-4 text-small bg-white/10 rounded-2xl p-3 font-semibold whitespace-pre-wrap break-words text-gray-300">
        {comment}
      </div>

      <hr className="my-3 border-black/30" />
		<Rating rating={star} className=" my-3 justify-center"></Rating>
      {/* LIKE BUTTON */}
      <LikeButton
        Likes={Likes}
        Dislikes={Dislikes}
        state={state}
        onLike={handleLike}
        onDislike={handleDislike}
      />
    </div>
  );
}

export default Comment;