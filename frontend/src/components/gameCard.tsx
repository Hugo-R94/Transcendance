import { useNavigate } from "react-router-dom";

type CardProps = {
  id: number;
  name: string;
  tag: string;
  imgLink: string;
  className?: string;
};

function GameCard({ id, name, tag, imgLink, className }: CardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/game/${id}`)}
      className={`balatro relative w-3/5 aspect-[6/9] cursor-pointer overflow-hidden rounded-2xl lg:outline-8 md:outline-7  outline-5 outline-gray-200 ${className}`}
    >
      {/* IMAGE */}
      <img
        src={imgLink}
        alt={name}
        className="h-full w-full object-cover"
      />

      {/* OVERLAY FIXE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
        
        {/* TEXTE */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-gray-200 drop-shadow">
            {name}
          </p>

          <p className="text-xs text-gray-300">
            {tag}
          </p>
        </div>

      </div>
    </div>
  );
}

export default GameCard;