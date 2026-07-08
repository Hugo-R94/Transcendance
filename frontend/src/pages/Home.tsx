import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";


function Home() {
	return(
      <div className="min-h-screen flex items-center justify-center text-white">
		<ShaderBackground></ShaderBackground>
		<NavBar></NavBar>
		</div>
	)
}

export default Home;