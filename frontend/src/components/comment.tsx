import LikeButton from "./LikeButton";
import Rating from "./getRating";

type CommentProps = {
  commentId: number;
  userId: number;
  UUID: number;
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
};

function Comment({
  commentId,
  userId,
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
}: CommentProps) {
  const colors = [
    "bg-[#00509f]",
    "bg-[#3c9b71]",
    "bg-[#ed8a00]",
    "bg-[#fb4740]",
  ];

  const color = colors[commentRowNb % colors.length];

  return (
    <div className={`w-full rounded-2xl p-4 shadow-md shadow-black/20 my-3 ${color}`}>
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white">
          {Nickname ? Nickname.charAt(0).toUpperCase() : "U"}
        </div>

        <div>
          <p className="font-bold text-left text-gray-300">{Nickname}</p>
          <p className="text-xs text-left font-semibold text-gray-300/75">
            Master Gambler
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