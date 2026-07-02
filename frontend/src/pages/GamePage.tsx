import { useParams } from "react-router-dom";
import ShaderBackground from "../components/shaderBG";
import NavBar from "../components/navBar";
import StarRating from "../components/star";
import Comment from "../components/comment";

const games = [
  {
	id: 1,
	appid: 553850,
	name: "HELLDIVERS™ 2",
	description: "The Galaxy’s Last Line of Offence. Enlist in the Helldivers and join the fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person shooter.",
	cover: "https://cdn2.steamgriddb.com/thumb/0e3900565e35576ba54faf1c53093932.jpg",
	hero: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/56fcbe062798a21624ec45f1325089995883973f/page_bg_raw.jpg?t=1779899567",
  }
];

const comments = [
	{
		UUID: 25,
		Nickname: "pedro",
		comment: "POUR LA DEMOCRATIE!",
	},
	{
		UUID: 234,
		Nickname: "Louis",
		comment: "POUR LA DEMOCRATIE! YES",
	},
	{
		UUID: 23,
		Nickname: "eliot",
		comment: "POUR LA DEMOCRATIE! NO",
	},
	
	{
		UUID: 67,
		Nickname: "XX-Gamerz",
		comment: "POUR LA DEMOCRATIE! MAYBE",
	}
];


function GamePage() {
  const { id } = useParams();

  const game = games.find((g) => g.id === Number(id));

  if (!game) {
    return <div className="text-white p-10">Game not found</div>;
  }

  return (
    <div className="min-h-screen text-white sm:flex sm:flex-col">
		<ShaderBackground />

      {/* Barre gauche */}
      {/* <div className="sm:fixed sm:left-0 sm:top-0 sm:w-[18%] w-full h-screen bg-gray-500 rounded-2xl">
			
				
			<div className="absolute bg-[#334b4d] h-90 w-full top-100 mx-5 rounded-2xl shadow-lg shadow-black  ">
				
			</div>
			
			
			<div className="balatro absolute bg-gray-400 h-60 w-40 top-50 left-18 rounded-2xl outline-5 outline-white shadow-lg shadow-black hover:shadow-xl">
				<img src={game.cover} className="object-fit h-full w-full"></img>
			</div>
		</div> */}








      {/* Barre droite */}
      {/* <div className="fixed right-0 top-0 w-[18%] h-screen bg-white z-20" /> */}



      {/* Contenu central */}
		<img src={game.hero} className="absolute -z-1 fixed object-cover h-full w-full -top-15 m-auto mask-b-from-40% mask-b-to-70%"></img>

		<div className="sm:fixed sm:top-0 sm:w-[18%] w-full h-screen rounded-2xl">
			
				
			{/* <div className="absolute bg-[#334b4d] h-90 w-full top-100 mx-5 rounded-2xl shadow-lg shadow-black  ">
				
			</div> */}
				{/* <div className="top-90 bg-sky-200 absolute w-4/5 aspect-[6/9] mx-auto rounded-2xl outline-5 outline-white shadow-lg shadow-black overflow-hidden">
				</div> */}
				
			<div className="absolute left-1/2 top-1/2  -translate-x-1/2  sm:w-[90%] w-2/3 aspect-[6/9]">

				{/* Carte arrière */}
				<div className="absolute inset-0  rounded-2xl bg-[#334b4d] shadow-lg" />

				{/* Carte avant */}
				<div className="absolute inset-x-[10%] -top-[60%] w-[80%] aspect-[6/9] rounded-2xl overflow-hidden shadow-xl">
					<img
						src={game.cover}
						className="w-full h-full object-cover"
					/>
				</div>

			</div>
		</div>

		
      <main className="sm:  sm:mx-[20%] min-h-screen sm:w-3/5 p-4  z-10 ">


		<div className="h-fit sm:mt-100 mt-0 rounded-xl flex flex-col  ">
			
			<div className="w-full h-fit rounded-2xl p-5  text-left bg-black/40">
				<p className="text-3xl top-0 left-0 font-bold"> {game.name} </p>
				<p className="font-semibold opacity-70 mt-0">by: developer</p>
				<p className="font-semibold mt-45 break-words">{game.description}</p>
				<hr className="solid my-5"></hr>
				<p className="text-sm opacity-60">Tag : shooter, tactique, pacification, diplomatie</p>
			</div>
			
			{/* leave a comment */}
			<div className="bg-black/40 w-full h-fit mt-5 rounded-2xl p-3">
				<div className="w-full h-15 flex">
					<div className="bg-gray-400 w-15 h-15 rounded-full"></div>
					<p className="font-bold inset-x-0 my-auto"> Did you like this game ?</p>
				</div>
				
				<textarea
				className="w-full h-50 my-3 rounded-2xl bg-gray-200 text-gray-800 p-3 resize-none overflow-y-auto focus:outline-none"
				placeholder="Write your comment..."
				></textarea>
				<StarRating rating={3.5}/>
				<button className="bg-[#00509f] w-30 h-15 mt-3 rounded-2xl balatro shadow-md shadow-black font-bold active:scale-90 hover:outline-2 hover:outline-white ">SUBMIT</button>
			</div>
			{/* <div className="w-full h-100 rounded-2xl mt-5 bg-[#334b4d] outline-5 outline-white ">
				<p className="text-2xl top-0 left-2 font-bold">
					comment : 
				</p>
			</div> */}
			{comments.map((comment, index) => (
			<Comment
				key={comment.UUID}
				UUID={comment.UUID}
				Nickname={comment.Nickname}
				comment={comment.comment}
				commentRowNb={index}
			/>
			))}
		</div>
		
    	<NavBar />

		
      </main>
    </div>
  );
}
export default GamePage;