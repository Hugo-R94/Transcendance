import type { ReactNode } from "react";



type CommentProps = {
  UUID: number;
  Nickname: string;
  comment: string;
  commentRowNb: number;
};

function Comment({ UUID, Nickname, comment , commentRowNb}: CommentProps) {
	const colors = [
		"bg-[#00509f]",
		"bg-[#3c9b71]",
		"bg-[#ed8a00]",
		"bg-[#fb4740]",
	];
	const color = colors[commentRowNb % 4];
	
  return (
	<div className={`w-full rounded-2xl p-4 shadow-md shadow-black/20 my-3 ${color}`}>
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white">
          {Nickname.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-bold text-gray-900">{Nickname}</p>
          <p className="text-xs text-gray-500">User #{UUID}</p>
        </div>
      </div>

      {/* Commentaire */}
      <p className="mt-4 text-small font-semibold whitespace-pre-wrap break-words text-gray-800">
        {comment}
      </p>
    </div>
  );
}

export default Comment;