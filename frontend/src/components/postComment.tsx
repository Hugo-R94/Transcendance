import type { ReactNode } from "react";
import StarRating from "./star";

function postComment({}) {
			
	return (
          <div className="bg-black/40 w-full h-fit mt-5 rounded-2xl p-3">
            <div className="w-full h-15 flex items-center gap-3">
              <div className="bg-gray-400 w-15 h-15 rounded-full"></div>
              <p className="font-bold inset-x-0 my-auto">Did you like this game ?</p>
            </div>
            <textarea
              className="w-full h-50 my-3 rounded-2xl bg-gray-200 text-gray-800 p-3 resize-none overflow-y-auto focus:outline-none"
              placeholder="Write your comment..."
            ></textarea>
            <StarRating rating={3.5} className="justify-center" />
            <button className="bg-[#00509f] w-30 h-15 mt-3 rounded-2xl balatro shadow-md shadow-black font-bold active:scale-90 hover:outline-2 hover:outline-white">
              SUBMIT
            </button>
          </div>

	);
}

export default postComment;