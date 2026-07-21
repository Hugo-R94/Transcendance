import DropdownMenu from "../components/DropdownMenu";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";


function Profil() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <ShaderBackground />
      <NavBar />


      {/* Contenu principal */}
      <main className="hidden sm:flex-1 sm:flex flex-col mx-[5%] w-[90%] pt-22 pb-4">

        {/* Header */}
        <div className="hidden sm:flex mt-3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   w-full gap-3 lg:aspect-[12/1] sm:aspect-[8/1] p-2">

          {/* Photo */}
          <div className="bg-gray-400 h-full aspect-square rounded-full ml-5 shadow-md shadow-black overflow-hidden outline-3 outline-white"> 
			<img src="https://thispersondoesnotexist.com/random-person.jpeg"></img></div>

          {/* Infos */}
          <div className="flex flex-col justify-center flex-shrink-0 p-1 text-left ">
            <p className="font-bold text-md text-gray-300 whitespace-nowrap">
              GamerxxDu75xx
            </p>

            <p className="font-semibold text-sm text-gray-300/75">
              Master Gambler
            </p>

          </div>

          {/* About */}
          <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black p-3 overflow-auto">
            <p className="font-bold md:text-md text-sm text-gray-300">
              ABOUT ME :
            </p>

            <p>Ceci est une description du gros gamer puant qu'est GamerxxDu75xx, argent 3 sur lol apres 15 ans de jeu et aucun autre jeu a son actif depuis. HARDSTUCK FOR LIFE</p>
          </div>

        </div>

        {/* Catégories */}
        <div className="flex gap-3 my-3 h-15 rounded-2xl bg-[#334b4d] shadow-md shadow-black/75 text-white p-2">

          <button className="flex-1 bg-bblue rounded-2xl balatro shadow-md shadow-black">
            PROFIL
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-byellow rounded-2xl balatro shadow-md shadow-black">
            GAMES
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bred rounded-2xl balatro shadow-md shadow-black">
            REVIEWS
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bgreen rounded-2xl balatro shadow-md shadow-black">
            FRIENDS
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bblue rounded-2xl balatro shadow-md shadow-black">
            GAMBLES
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-byellow rounded-2xl balatro shadow-md shadow-black">
            CLICKER
          </button>

        </div>

        {/* Contenu */}
        <div className="flex-1 bg-black/50 rounded-2xl my-2 overflow-auto">
          {/* contenu */}
        </div>

      </main>
	  
	  {/* format mobile */}
	  <div className="sm:hidden flex flex-col w-full min-h-screen ">
	  {/* Profil picture */}
		<div className="bg-black w-[50%] mt-25 mx-auto  overflow-hidden aspect-square rounded-full shadow-md shadow-black/75 outline-5 outline-white">
			<img src="https://thispersondoesnotexist.com/random-person.jpeg" alt="thispersondoesnotexist profil picture" />
		</div>
		
		{/* Name title */}
		<div className="bg-bgreen p-3 mx-auto mt-3 w-fit h-fit rounded-2xl shadow-black shadow-md">
			<p className="font-bold text-2xl text-white">GamerxxDu75xx</p>
			<p className="text-white/50 text-lg">Master Gambler</p>
			
		</div>
		
		<div className="bg-black/50 w-[90%] mx-[5%] h-fit p-3 rounded-2xl shadow-md shadow-black/70 my-3">
			<p className="text-white text-xl font-bold">ABOUT ME :</p>
			<p className="text-white/75">Ceci est une description du gros gamer puant qu'est GamerxxDu75xx, argent 3 sur lol apres 15 ans de jeu et aucun autre jeu a son actif depuis. HARDSTUCK FOR LIFE</p>
		 </div>
		
		{/* menu deroulant */}
		<div className="bg-bred w-[80%] mx-auto h-20 my-3 rounded-2xl shadow-black shadow-md">
		</div>
		
		<div className="bg-black/50 rounded-2xl mt-5 w-[95%] mx-auto h-200 mb-5">
			
		</div>
		
	  </div>
    </div>
  );
}

export default Profil