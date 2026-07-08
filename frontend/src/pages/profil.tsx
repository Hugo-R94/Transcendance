import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";


function Profil(){
	return (
	<div className="relative min-h-screen">
		<ShaderBackground/>
		<NavBar />
		
		<div className="bg-white w-full h-15 mt-22">
		</div>
		
		
		<div className="bg-gray-400 w-full h-150  ">
		</div>
		
	</div>
	);
}

export default Profil