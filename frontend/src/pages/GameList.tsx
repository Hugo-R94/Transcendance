import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GameList from "../components/gameList";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";
import Pagination from "../components/paginationController";
import Leaderboard from "../components/leaderboard";
import api from "../api/api";
import DropdownMenu from "../components/dropdownFilter";

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

  const genre = searchParams.get("genre") || "";
  const orderBy = searchParams.get("orderBy") || "";

  const [totalPages, setTotalPages] = useState(1);


  const genres = [
    { label: "Action", value: "action" },
    { label: "Aventure", value: "adventure" },
    { label: "FPS", value: "fps" },
    { label: "RPG", value: "rpg" },
    { label: "Sport", value: "sport" },
  ];


  const orderOptions = [
    {
      label: "Date de sortie ↑",
      value: "release_date_asc",
    },
    {
      label: "Date de sortie ↓",
      value: "release_date_desc",
    },
    {
      label: "Meilleure note ↑",
      value: "rating_asc",
    },
    {
      label: "Meilleure note ↓",
      value: "rating_desc",
    },
    {
      label: "Plus joués",
      value: "most_played",
    },
    {
      label: "Moins joués",
      value: "less_played",
    },
    {
      label: "Nom A → Z",
      value: "name_asc",
    },
    {
      label: "Nom Z → A",
      value: "name_desc",
    },
  ];


  function changeFilter(
    type: "genre" | "orderBy",
    value: string
  ) {
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
        setGames(res.data.games);
        setTotalPages(res.data.total_pages);
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



      <div className="sm:fixed sm:left-1/2 sm:-translate-x-1/2 sm:w-3/5 h-full mt-5 sm:mt-0 top-22.5">


        <div className="w-full flex justify-center items-center py-5 h-17 sm:mt-0 mt-20">


          <p className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            WHAT'S HOT ?
          </p>



          <DropdownMenu

            Name="Genre"

            className="mx-5"

            items={genres}

            value={genre}

            onChange={(value) =>
              changeFilter("genre", value)
            }

            color="bg-bblue"

          />



          <DropdownMenu

            Name="Tri"

            className="mx-5"

            items={orderOptions}

            value={orderBy}

            onChange={(value) =>
              changeFilter("orderBy", value)
            }

            color="bg-bred"

          />


        </div>



        <GameList games={games} />



        <div className="w-full mt-3 flex justify-center items-center">

          <Pagination

            page={page}

            totalPages={totalPages}

            onPageChange={changePage}

          />

        </div>


      </div>



      {/* <div className="absolute w-1/5 right-0 h-full p-2">

        <Leaderboard />

      </div>
 */}


      <NavBar />


    </div>

  );
}


export default Games;
