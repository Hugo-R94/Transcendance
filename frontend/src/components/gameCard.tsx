import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type CardProps = {
	id: number;
  name: string;
  tag: string;
  imgLink: string;
};

function GameCard({ id, name, tag, imgLink }: CardProps) {
  const navigate = useNavigate();

  return (
	<div
		onClick={() => navigate(`/game/${id}`)}
		className="relative balatro h-96 w-64 cursor-pointer overflow-hidden rounded-2xl outline-10 outline-gray-200"
		>
      {/* IMAGE */}
      <img
        src={imgLink}
        alt={name}
        className="h-full w-full object-fill"
      />

      {/* OVERLAY */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col shadow-md shadow-black gap-1 bg-gradient-to-t from-black/80 to-transparent p-4">
        
		<p className="absolute text-2xl  bottom-10 left-3 font-bold text-gray-200 leading-tight ">
		{name}
		</p>

		<p className="absolute text-xs bottom-5 text-gray-300 leading-snug">
		{tag}
		</p>
      </div>

    </div>
  );
}

export default GameCard;