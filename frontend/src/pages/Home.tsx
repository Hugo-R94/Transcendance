import Grid from "../components/grid";
import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <ShaderBackground />
      <NavBar />
      <div className="w-full h-fit translate-y-10 flex flex-col items-center justify-center text-center">
        {/* Titre avec le style exact demandé */}
        <p className="text-5xl text-gray-300 font-bold">
          Bienvenue sur <span className="text-white">Click</span>
          <span className="text-[#ef4639]">Bet</span>
        </p>

        {/* Texte ajusté pour être plus percutant */}
        <h6 className="text-xl text-gray-300/75 mt-2">
          La première plateforme hybride pour noter vos jeux vidéo et parier sur l'actu gaming
        </h6>

        {/* Boutons positionnés côte à côte */}
        <div className="flex flex-col gap-4 mt-6">
          <a href="http://localhost:5173/games">
			<button className="balatro bg-bblue h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
            Découvrir les jeux
          </button>
		  </a>
		  
		  <a href="http://localhost:5173/login">
          <button className="balatro bg-byellow h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
            Se connecter
          </button>
		  </a>
		  
			<a href="http://localhost:5173/signin">
          <button className="balatro bg-bred h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
            S'inscrire
          </button>
		  </a>
		  
        </div>
      </div>
    </div>
  );
}

export default Home;