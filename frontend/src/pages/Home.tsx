import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import GameCard from "../components/gameCard";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";
import Pagination from "../components/paginationController";

interface GameListItem {
  appid: number;
  name: string;
  header_image: string;
}

interface GamesPageResponse {
  games: GameListItem[];
  total: number;
  page: number;
  total_pages: number;
}

function Home() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);

    axios
      .get<GamesPageResponse>(
        `${import.meta.env.VITE_API_URL}/game/games`,
        {
          params: {
            page,
          },
        }
      )
      .then((res) => {
        setGames(res.data.games);
        setTotalPages(res.data.total_pages);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les jeux");
      })
      .finally(() => setLoading(false));

  }, [page]);


  function changePage(newPage: number) {
    setSearchParams({
      page: String(newPage),
    });
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }


  return (
    <div className="min-h-screen text-white">
      <ShaderBackground />

      <div className="fixed sm:mx-[20%] h-full top-22.5 sm:w-3/5">

        <div className="w-full h-15 items-center justify-center p-5">
          <p className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            WHAT'S HOT ?
          </p>
        </div>


        <div className="w-full h-[70%]">

          {[0, 1, 2].map((row) => (

            <div
              key={row}
              className="h-1/3 w-full flex justify-center items-center p-10"
            >

              {games
                .slice(row * 5, row * 5 + 5)
                .map((game, index) => {

                  const center = 2;
                  const offset = index - center;

                  return (
                    <div
                      key={game.appid}
                      className="relative transition-all duration-300 hover:z-[9999]"
                      style={{
                        marginLeft: index === 0 ? 0 : -50,
                        transform: `
                          rotate(${offset * 8}deg)
                          translateY(${Math.abs(offset) * 20}px)
                        `,
                      }}
                    >

                      <GameCard id={game.appid} name={game.name} tag="" imgLink={game.header_image} />

                    </div>
                  );

                })}

            </div>

          ))}

        </div>



        <div className="w-full mt-5 flex justify-center items-center ">
		  <Pagination page={page} totalPages={totalPages} onPageChange={changePage}></Pagination>
        </div>

      </div>


      <NavBar />

    </div>
  );
}

export default Home;