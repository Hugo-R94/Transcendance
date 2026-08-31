import { useEffect, useRef, useState } from "react";
import GameCard from "./gamepage/gameCard";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

interface GameListProps {
  games: Game[];
}

type DisplayGame = Game & { _leaving?: boolean };

const STAGGER_MS = 60;
const ANIM_MS = 350;

const CARD_W = 120; 
const CARD_W_SM = 140; 
const OVERLAP = 5; 
const OVERLAP_SM = 5; 

function GameList({ games }: GameListProps) {
  const [displayGames, setDisplayGames] = useState<DisplayGame[]>(games);
  const prevGames = useRef<Game[]>(games);
  const containerRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<{ rows: number; cols: number }>({
    rows: 2,
    cols: 5,
  });

  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMd(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateLayout = () => {
      if (!containerRef.current) return;
      const { clientHeight } = containerRef.current;

      let targetRows = 2;
      if (clientHeight < 380) targetRows = 1;
      else if (clientHeight > 650) targetRows = 3;

      const targetCols = Math.max(1, Math.ceil(games.length / targetRows));
      setLayout({ rows: targetRows, cols: targetCols });
    };

    const observer = new ResizeObserver(updateLayout);
    observer.observe(containerRef.current);
    updateLayout();

    return () => observer.disconnect();
  }, [games.length]);

  useEffect(() => {
    const nextIds = new Set(games.map((g) => g.appid));
    const removed = prevGames.current.filter((g) => !nextIds.has(g.appid));

    if (removed.length === 0) {
      setDisplayGames(games);
      prevGames.current = games;
      return;
    }

    setDisplayGames(() => {
      const stillHere = games.map((g) => ({ ...g, _leaving: false }));
      const leaving = removed.map((g) => ({ ...g, _leaving: true }));
      return [...stillHere, ...leaving];
    });

    const timeout = setTimeout(() => {
      setDisplayGames(games.map((g) => ({ ...g, _leaving: false })));
      prevGames.current = games;
    }, removed.length * STAGGER_MS + ANIM_MS);

    return () => clearTimeout(timeout);
  }, [games]);

  const { rows, cols } = layout;
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  const cardW = isMd ? CARD_W : CARD_W_SM;
  const overlap = isMd ? OVERLAP : OVERLAP_SM;

  return (
    <>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translate(-30vw, 50vh) scale(0.4) rotate(45deg); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes card-exit {
          from { opacity: 1; transform: translate(0, 0) scale(1); }
          to   { opacity: 0; transform: translate(30vw, 50vh) scale(0.4) rotate(-45deg); }
        }
      `}</style>

      <div
        ref={containerRef}
        className="w-full h-auto md:h-full flex items-center justify-center relative p-2 z-10"
      >
       {/* Desktop */}
        <div className="hidden sm:flex sm:flex-col justify-around items-center w-full h-full relative -translate-y-20 pointer-events-none">
          {rowArray.map((rowIndex) => {
            const rowGames = displayGames.slice(rowIndex * cols, rowIndex * cols + cols);
            const n = rowGames.length;
            const rowCenterPivot = (n - 1) / 2;

            const totalWidth = n > 0 ? cardW + (n - 1) * (cardW - overlap) : 0;

            return (
              <div
                key={rowIndex}
                className="w-full flex-1 relative flex items-center justify-center"
              >
                <div
                  className="absolute"
                  style={{
                    width: totalWidth,
                    height: 0,
                  }}
                >
                  {rowGames.map((game, colIndex) => {
                    const offset = colIndex - rowCenterPivot;
                    const flatIndex = rowIndex * cols + colIndex;
                    const left = colIndex * (cardW - overlap);

                    return (
                      <div
                        key={game.appid}
                        className="absolute group hover:z-50"
                        style={{
                          left,
                          width: cardW,
                          top: "-50%",
                          transform: `rotate(${offset * 6}deg) translateY(${Math.abs(offset) * 6}px)`,
                          transformOrigin: "center center",
                        }}
                      >
                        <div
                          className="transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-6 group-hover:rotate-0 hover:z-100 shadow-2xl rounded-xl pointer-events-auto"
                          style={{
                            animation: `${game._leaving ? "card-exit" : "card-enter"} ${ANIM_MS}ms ease forwards`,
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
              </div>
            );
          })}
        </div>

        {/* MOBILE */}
        <div className="grid grid-cols-2 gap-6 sm:hidden w-full max-w-full h-auto p-4 overflow-x-hidden">
          {displayGames
            .filter((g) => !g._leaving)
            .map((game) => (
            <div key={game.appid} className="w-full">
                <GameCard id={game.appid} name={game.name} tag="" imgLink={game.header_image} className="w-full h-auto object-cover" />
            </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default GameList;