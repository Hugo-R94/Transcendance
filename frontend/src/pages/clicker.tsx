import NavBar from "../components/navBar"
import ShaderBackground from "../components/shaderBG"

function Clicker(){
	return(
		<div className="flex relative min-h-screen">
			<ShaderBackground/>
			<NavBar/>
			<div className="sm:flex gap-5 w-[90%] mx-auto h-150 mt-30 ">
				
				<div className="bg-bdarkgreen w-[80%] h-full card">
					
				</div>
				
				
				<div className="bg-bdarkgreen w-[20%] h-full card p-3">
					LEADERBOARD
				</div>
				
			</div>
		</div>
	)
}

export default Clicker