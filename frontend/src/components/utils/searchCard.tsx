interface Game {
  appid: number;
  name: string;
  header: string;
}

function SearchCard({ appid, name, header, index }: Game) {
	const colors = [
    "bg-[#00509f]",
    "bg-[#3c9b71]",
    "bg-[#ed8a00]",
    "bg-[#fb4740]",
  ];
   const color = colors[index % 4];

  return (
	<a href={`http://localhost:5173/game/${appid}`}>
    <div className={`flex ${color} w-full h-15 rounded-2xl p-1 transition overflow-x-auto hover:scale-105 shadow-sm shadow-black hover:outline-3`}>

      <div className="bg-gray-600 h-full aspect-square rounded-2xl mr-1 overflow-hidden">
        <img
          className="h-full w-full object-cover rounded-2xl object-cover"
          src={header}
          alt={name}
        />
      </div>

      <div className="relative bg-black/40 w-full h-full rounded-2xl p-2 text-gray-300 flex justify-center items-center">
        <p className="ml-2 font-bold text-sm">
          {name}
        </p>

      </div>

    </div>
	</a>
  );
}

export default SearchCard;