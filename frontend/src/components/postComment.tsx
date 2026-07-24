import { useState } from "react";
import StarRating from "./star";
import { postComment } from "../api/comments";
import type { PostCommentRequest } from "../api/comments";

interface PostCommentProps {
	gameId: number;
}

function PostComment({ gameId }: PostCommentProps) {
	const [comment, setComment] = useState("");
	const [title, setTitle] = useState("");
	const [rating, setRating] = useState(0);
	// const gameidd = 130
	const handlePostComment = async () => {
  if (!comment.trim()) {
    return;
  }

  try {
    await postComment({
      gameID: gameId,
      comment: comment,
      commentTitle: title,
      rating,
    });

    setComment("");
    setTitle("");
    setRating(0);

    console.log("Comment posted");
  } catch (error) {
    console.error("Error posting comment:", error);
  }
};

	return (
		<div className="bg-black/40 w-full h-fit mt-5 rounded-2xl p-3">
			<div className="w-full h-15 flex items-center gap-3">
				<div className="bg-gray-400 w-15 h-15 rounded-full"></div>
				<p className="font-bold inset-x-0 my-auto">
					Did you like this game ?
				</p>
			</div>
			<textarea value={title}
			onChange={(e) => setTitle(e.target.value)}
			 className="bg-gray-200 w-[75%] h-10 mt-3 rounded-2xl bg-gray-200 text-gray-800 p-2 resize-none overflow-y-auto focus:outline-none"
			placeholder="Write your title...">
				
			</textarea>

			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				className="w-full h-50 m-3 rounded-2xl bg-gray-200 text-gray-800 p-3 resize-none overflow-y-auto focus:outline-none"
				placeholder="Write your comment..."
			/>
			<StarRating className="justify-center" rating={rating} onChange={(note) => setRating(note)} />
			<button
				onClick={handlePostComment}
				className="bg-[#00509f] w-30 h-15 mt-3 rounded-2xl balatro shadow-md shadow-black font-bold active:scale-90 hover:outline-2 hover:outline-white"
			>
				SUBMIT
			</button>
		</div>
	);
}

export default PostComment;