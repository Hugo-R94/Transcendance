import type { ReactNode } from "react";



type CommentProps = {
  UUID: number;
  Nickname: string;
  CommentTitle: string;
  comment: string;
  commentRowNb: number;
  Likes: number;
  Dislikes: number;
};

function Comment({ UUID, Nickname, comment , commentRowNb, CommentTitle, Likes, Dislikes}: CommentProps) {
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
        </div>
      </div>

      {/* Commentaire */}
      <p className="font-bold text-lg">{CommentTitle}</p>
      <div className="mt-4 text-small bg-black/10 rounded-2xl p-3 font-semibold whitespace-pre-wrap break-words text-gray-800">
        {comment}
      </div>

      <hr className="solid my-3 border-black/30"></hr>

      <div className="w-50 h-10  rounded-2xl flex m-auto">
       <button className="flex items-center gap-2 bg-black/30 w-1/2 h-full inset-0 p-1 left-0 mr-1 rounded-l-2xl balatro active:scale-90">
        <svg  className="h-full stroke-gray-300/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path className="stroke-gray-300" stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
        </svg>
        <p className="mx-auto">{Likes}</p>
       </button>
       <button className="flex items-center gap-2 bg-black/30 w-1/2 p-1 h-full inset-0 right-0 rounded-r-2xl balatro active:scale-90">
        <svg className="h-full rotate-180 stroke-gray-300/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path className="stroke-gray-300" stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
        </svg>
        <p>{Dislikes}</p>
        </button>
      </div>
    </div>
  );
}

export default Comment;