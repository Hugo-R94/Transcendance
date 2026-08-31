import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GameList from "../components/gameList";
import NavBar from "../components/utils/navBar";
import Pagination from "../components/utils/paginationController";
import api from "../api/api";
import DropdownMenu from "../components/utils/dropdownFilter";

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

export const genres = [
  { label: "Action", value: "Action" },
  { label: "Sport", value: "Sport" },
  { label: "Aventure", value: "Adventure" },
  { label: "Strategie", value: "Strategy" },
  { label: "Indie", value: "Indie" },
  { label: "Simulation", value: "Simulation" },
  { label: "RPG", value: "RPG" },
  { label: "Free To Play", value: "Free To Play" },
  { label: "Casual", value: "Casual" },
  { label: "Racing", value: "Racing" },
];

export const orderOptions = [
  { label: "Date de sortie ↑", value: "release_date_asc" },
  { label: "Date de sortie ↓", value: "release_date_desc" },
  { label: "Moins bien note sur steam", value: "rating_asc" },
  { label: "Mieux note sur steam", value: "rating_desc" },
  { label: "Plus joués", value: "most_played" },
  { label: "Moins joués", value: "less_played" },
  { label: "Nom A → Z", value: "name_asc" },
  { label: "Nom Z → A", value: "name_desc" },
];

function Games() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const genre = searchParams.get("genre") || "";
  const orderBy = searchParams.get("orderBy") || "";

  const [totalPages, setTotalPages] = useState(1);

  function changeFilter(type: "genre" | "orderBy", value: string) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    params.set("page", "1");
    setSearchParams(params);
  }

  useEffect(() => {
    setLoading(true);

    api
      .get<GamesPageResponse>("/game/games", {
        params: {
          page,
          genre,
          orderBy,
        },
      })
      .then((res) => {
        setGames(res.data.games || []);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les jeux");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, genre, orderBy]);

  function changePage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  }

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      <NavBar />

      <div className="relative pt-20 pb-10 px-2 flex flex-col items-center justify-between sm:fixed sm:left-1/2 sm:-translate-x-1/2 sm:w-4/5 lg:w-3/5 sm:h-[calc(100vh-120px)] sm:top-20 sm:p-2 sm:pb-2">
        
		<div className="w-full flex justify-center items-center mt-3 py-2 shrink-0 gap-4 z-30 relative">
		<p className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] hidden sm:block">
			WHAT'S HOT ?
		</p>

		<DropdownMenu
			Name="Genre"
			items={genres}
			value={genre}
			onChange={(value) => changeFilter("genre", value)}
			color="bg-bblue"
		/>

		<DropdownMenu
			Name="Tri"
			items={orderOptions}
			value={orderBy}
			onChange={(value) => changeFilter("orderBy", value)}
			color="bg-bred"
		/>
		</div>

        <div className="w-full flex-1 sm:min-h-[300px] flex items-center justify-center my-2">
          {loading ? (
            <div className="flex h-40 sm:h-full w-full items-center justify-center text-gray-400">
              Chargement...
            </div>
          ) : error ? (
            <div className="flex h-40 sm:h-full w-full items-center justify-center text-red-400">
              {error}
            </div>
          ) : games.length === 0 ? (
            <div className="flex h-40 sm:h-full w-full items-center justify-center text-gray-400">
              Aucun jeu trouvé
            </div>
          ) : (
            <GameList games={games} />
          )}
        </div>

        <div className="w-full flex justify-center items-center shrink-0 py-2 mt-4 sm:mt-0">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </div>

      </div>
    </div>
  );
}

export default Games;