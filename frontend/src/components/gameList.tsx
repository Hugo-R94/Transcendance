import GameCard from "./gameCard";

interface Game {
  appid: number;
  name: string;
  header_image: string;
}

interface GameFanGridProps {
  games: Game[];
}

function gameList({ games }: GameFanGridProps) {
  return (
    <>
      {/* Desktop / Tablette */}
      <div className="hidden sm:block w-full h-[70%] ">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="h-1/3 w-full flex justify-center items-center p-10"
          >
            {games.slice(row * 5, row * 5 + 5).map((game, index) => {
              const center = 2;
              const offset = index - center;

              return (
                <div
                  key={game.appid}
                  className="relative transition-all duration-300 hover:z-[9999] hover:scale-105"
                  style={{
                    marginLeft: index === 0 ? 0 : -50,
                    transform: `
                      rotate(${offset * 8}deg)
                      translateY(${Math.abs(offset) * 20}px)
                    `,
                  }}
                >
                  <GameCard
                    id={game.appid}
                    name={game.name}
                    tag=""
                    imgLink={game.header_image}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-2 gap-y-5 gap-x-0 sm:hidden p-4">
        {games.map((game) => (
          <div key={game.appid} className="flex justify-center">
            <GameCard
              id={game.appid}
              name={game.name}
              tag=""
              imgLink={game.header_image}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default gameList;