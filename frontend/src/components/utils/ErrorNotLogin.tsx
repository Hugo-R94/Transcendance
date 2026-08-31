
function ErrorNotLogin(){
	return(
	<div className="v w-full min-h-screen flex items-center">
			
		 <div className="bg-bdarkgreen w-fit h-fit mx-auto rounded-2xl p-5 flex flex-col items-center justify-center shadow-black/75 shadow-md">
		 	<p className="text-white font-bold text-lg">You need to be logged to do that !</p>
		 	<a href="http://localhost:5173/login"  className="bg-bred w-1/2 h-15 rounded-2xl mt-5 hover:outline-3 outline-white balatro shadow-black/75 shadow-md flex justify-center items-center">
		 		<p className="text-white font-bold text-lg">LOGIN</p>
	 	</a>
		 </div>
		</div>
		
	);
	
}

export default ErrorNotLogin