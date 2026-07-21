import { useEffect, useRef, useState } from "react";
import GameCard from "./gameCard";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

interface GameFanGridProps {
  games: Game[];
}

type DisplayGame = Game & { _leaving?: boolean };

const STAGGER_MS = 60;   // délai entre chaque carte
const ANIM_MS = 350;     // durée d'une animation d'entrée/sortie

function GameList({ games }: GameFanGridProps) {
  const [displayGames, setDisplayGames] = useState<DisplayGame[]>(games);
  const prevGames = useRef<Game[]>(games);

  useEffect(() => {
    const prevIds = new Set(prevGames.current.map((g) => g.appid));
    const nextIds = new Set(games.map((g) => g.appid));

    const removed = prevGames.current.filter((g) => !nextIds.has(g.appid));

    if (removed.length === 0) {
      // Pas de suppression : on met juste à jour direct (les nouvelles jouent leur entrée)
      setDisplayGames(games);
      prevGames.current = games;
      return;
    }

    // On garde les cartes supprimées affichées, marquées "_leaving", le temps de l'anim
    setDisplayGames((current) => {
      const stillHere = games.map((g) => ({ ...g, _leaving: false }));
      const leaving = removed.map((g) => ({ ...g, _leaving: true }));
      // ordre: on remet les leaving à leur ancienne position relative (fin de liste ici, simple)
      return [...stillHere, ...leaving];
    });

    const timeout = setTimeout(() => {
      setDisplayGames(games.map((g) => ({ ...g, _leaving: false })));
      prevGames.current = games;
    }, removed.length * STAGGER_MS + ANIM_MS);

    return () => clearTimeout(timeout);
  }, [games]);

  return (
    <>
      <style>{`
        @keyframes card-enter {
          from {
            opacity: 1;
 			transform: translate(-50vw, 80vh) scale(0.4) rotate(45deg);
			 }
          to {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>

      {/* Desktop / Tablette */}
      <div className=" hidden sm:flex sm:flex-col w-full h-[70%] gap-y-8">
		{[0, 1, 2].map((row) => {
		const rowGames = displayGames.slice(row * 5, row * 5 + 5);
		const center = (rowGames.length - 1) / 2; // <-- dynamique, plus jamais figé à 2

		return (
			<div
			key={row}
			className="flex-1 w-full flex justify-center items-center"
			// plus de translate-x-7 ici
			>
			{rowGames.map((game, index) => {
				const offset = index - center;
				const flatIndex = row * 5 + index;

				return (
				<div
					key={game.appid}
					className="relative lg:translate-x-1/4 translate-x-1/8"
					style={{
					marginLeft: index === 0 ? 0 : "clamp(-40px, -3vw, -60px)",
					zIndex: game._leaving ? 0 : index,
					transform: `rotate(${offset * 6}deg) translateY(${Math.abs(offset) * 6}px)`,
					}}
				>
					<div
					className="transition-transform duration-300 hover:scale-105"
					style={{
						animation: `${game._leaving ? "card-exit" : "card-enter"} 100ms ease forwards`,
						animationDelay: `${flatIndex * STAGGER_MS}ms`,
						opacity: 0,
					}}
					>
					<GameCard id={game.appid} name={game.name} tag="" imgLink={game.header_image} />
					</div>
				</div>
				);
			})}
			</div>
		);
		})}
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-2 gap-y-5 gap-x-0 sm:hidden p-4">
        {displayGames.map((game, index) => (
          <div
            key={game.appid}
            className="flex justify-center"
          >
            <GameCard id={game.appid} name={game.name} tag="" imgLink={game.header_image} />
          </div>
        ))}
      </div>
    </>
  );
}

export default GameList;