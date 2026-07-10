import { useEffect, useState } from "react";
import SearchCard from "./searchCard";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

function Research({ input }) {
const [games, setGames] = useState<Game[]>([]);
useEffect(() => {
    if (!input.trim()) {
      setGames([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/game/search?q=${encodeURIComponent(input)}&limit=15`
        );

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des jeux");
        }

        const data = await res.json();
        setGames(data.games);

      } catch (err) {
        console.error(err);
        setGames([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  // Ne rien afficher si aucun jeu trouvé
  if (games.length === 0) {
    return null;
  }
console.log("games state:", games);
  return (
		<div className="absolute top-full left-0 mt-8  bg-[#334b4d] h-fit w-75 max-h-100 overflow-auto py-2 px-3 rounded-2xl no-scrollbar flex flex-col gap-y-2 shadow-lg -translate-x-5 shadow-lg shadow-black outline-5 outline-white transition">
		{games.map((game, index) => (
			<SearchCard
			key={game.appid}
			header={game.header_image}
			appid={game.appid}
			name={game.name}
			index={index}
			/>
		))}
		
		</div>
		);
}

export default Research;