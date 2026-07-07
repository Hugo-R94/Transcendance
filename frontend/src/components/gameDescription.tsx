import { useNavigate } from "react-router-dom";

type CardProps = {
  name: string;
  tag: string;
  description: string;
  developer?: string;
  className?: string;
};

function GameDescription({ name, tag, className, description, developer }: CardProps) {
  const navigate = useNavigate();

  return (
        <div className="h-fit mt-15 sm:mt-0 rounded-xl flex flex-col">
          <div className="w-full h-fit rounded-2xl p-5 text-left bg-black/40">
            <p className="text-3xl top-0 left-0 font-bold">{name}</p>
			<p className="font-semibold opacity-70 mt-0">by: ${developer}</p>
            <p className="font-semibold mt-45 break-words">{description}</p>
            <hr className="solid my-5" />
            <p className="text-sm opacity-60">Tag : shooter, tactique, pacification, diplomatie</p>
          </div>
		</div>
  );
}

export default GameDescription;