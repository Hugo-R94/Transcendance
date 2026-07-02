import { useState } from "react";
import GameCard from "../components/gameCard";
import Button from "../components/button";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";


const games = [
  {
    id: 1,
    name: "HELLDIVERS™ 2",
    tag: "Shooter",
    imgLink: "https://cdn2.steamgriddb.com/thumb/0e3900565e35576ba54faf1c53093932.jpg",
  },
  {
    id: 2,
    name: "CS 1.6",
    tag: "FPS",
    imgLink: "https://cdn2.steamgriddb.com/thumb/68addc821b387ab5cc91c846b627a586.jpg",
  },
  {
    id: 3,
    name: "Frostpunk",
    tag: "Survival",
    imgLink: "https://cdn2.steamgriddb.com/thumb/b3f6051d6431196ae3b6642a5615e9ec.jpg",
  },
  {
    id: 4,
    name: "Tetris 3D",
    tag: "Tactical FPS",
    imgLink: "https://cdn2.steamgriddb.com/thumb/1a009b56c1b7d90e5b4216fc0f9fa4e6.jpg",
  },
];

function Home() {
  const [count, setCount] = useState(0);

  return (
	
    <div className="min-h-screen  text-white">
		<ShaderBackground />

      <NavBar />

      <div className="mx-auto max-w-6xl p-6">

        <h1 className="mb-6 text-4xl font-bold">
          {count}
        </h1>

        <Button
          onClick={() => setCount(count + 1)}
          variant="primary"
        >
          +
        </Button>

        {/* GRID */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
			  id={game.id}
              name={game.name}
              tag={game.tag}
              imgLink={game.imgLink}
            />
          ))}
        </div>

        <div className="mt-10">
          <Button variant="danger" onClick={() => setCount(0)}>
            Reset
          </Button>
        </div>

      </div>
    </div>
  );
}

export default Home;