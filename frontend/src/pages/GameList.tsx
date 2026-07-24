import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import GameCard from "../components/gameCard";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";
import Pagination from "../components/paginationController";
import GameList from "../components/gameList";
import Research from "../components/research";
import Grid from "../components/grid";
import Leaderboard from "../components/leaderboard";
import api from "../api/api";

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

function Games() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);

	api.get<GamesPageResponse>("/game/games", {
	params: {
		page,
	},
	
	})

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
    <div className="sm:fixed sm:left-1/2 sm:-translate-x-1/2 sm:w-3/5 h-full mt-5 sm:mt-0 top-22.5 bg-gray-500/0 ">

		<div className="w-full flex justify-center py-5">
		<p className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
			WHAT'S HOT ?
		</p>
		</div>

		<GameList games={games}></GameList>
	
		<div className="w-full mt-3 flex justify-center items-center">
		<Pagination page={page} totalPages={totalPages} onPageChange={changePage}></Pagination>
		</div>

	</div>
		
		{/* <div className="bg-white w-1/5 h-100" /> */}
		{/* <div className="absolute bg-gray-300/20 w-1/5 h-full  ">
			
		</div> */}
	
		<div className="absolute w-1/5 right-0 h-full p-2  ">
			<Leaderboard>
			</Leaderboard>
			
		</div>
		
	<NavBar />

    </div>
  );
}

export default Games;
