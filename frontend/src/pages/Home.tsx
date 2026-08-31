import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full h-fit flex flex-col items-center justify-center text-center">
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
		  <Link to="/login">
			<button className="balatro bg-byellow h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
				Se connecter
			</button>
		  </Link>
		  
		  <Link to="/signin">
			<button className="balatro bg-bred h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
				S'inscrire
			</button>
		  </Link>
		  
        </div>
      </div>
    </div>
  );
}

export default Home;