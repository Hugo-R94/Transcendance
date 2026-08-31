import { useNavigate } from "react-router-dom";

type CardProps = {
  name: string;
  genres: string[];
  description: string;
  developers: string[];
  publishers: string[];
  className?: string;
  releaseDate: string;
};

function GameDescription({ name, genres, className, description, developers, publishers, releaseDate }: CardProps) {
  const navigate = useNavigate();

  return (
        <div className="h-fit mt-15 sm:mt-0 rounded-xl flex flex-col backdrop-blur-md">
          <div className="w-full h-fit rounded-2xl p-5 text-left bg-black/40">
            <p className="text-3xl top-0 left-0 font-bold">{name}</p>
            <div className="text-sm">
            <p className="font-bold text-sm opacity-70 mt-0">Release :<span className=" ml-2 text-sm font-light">{releaseDate}</span></p>
            </div>
            <div className="w-full h-5 flex gap-x-2 text-sm opacity-60 items-center">
                <p className="font-bold ">Developers : </p>
                {developers.map((dev, index) => <p key={index}> { dev }</p>)}
                
            </div>
            <div className="w-full h-5 flex gap-x-2 text-sm opacity-60 items-center mb-3 ">
                <p className="font-bold ">Publishers : </p>
                {publishers.map((publisher, index) => <p key={index}> { publisher }</p>)}
            </div>
            {/* <p className="font-semibold opacity-70">by: ${developer}</p> */}
            <p className="font-semibold mt-45 break-words">{description}</p>
            <hr className="solid my-5" />
            <div className="w-full h-5 flex gap-x-2 text-sm opacity-60 items-center">
                <p className="font-bold ">Genres : </p>
                {genres.map((genre, index) => <p key={index}> { genre }</p>)}
            </div>

          </div>
        </div>
  );
}

export default GameDescription;