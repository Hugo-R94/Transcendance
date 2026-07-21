import support from "../pages/support";

function supportContact(){
	return(
		<div className="bg-bdarkgreen w-full h-full rounded-2xl shadow-lg shadow-black/75 p-3">
			<p className="text-white font-bold mt-1">WHAT CAN WE DO FOR YOU?</p>
			
			<textarea className="flex text-white bg-black/50 w-[95%]  mx-auto h-[75%] my-4 rounded-2xl p-3 resize-none overflow-y-auto focus:outline-none" placeholder="Write your comment..." />
			
			<button className="bg-byellow w-35 h-[10%] rounded-2xl balatro hover:outline-3 hover:outline-white active:scale-90 sm:mt-1 mt-3">
				<p className="font-bold text-2xl text-white ">SUBMIT</p>
			</button>
			
		</div>
	);
}

export default supportContact