import NavBar from "../components/utils/navBar";
import SupportContact from "../components/support/supportContact";

function support() {


  return (
    <div className="relative min-h-screen items-center justify-center">
      {/* <div className="sm:w-1/2 w-[90%] sm:h-125 h-150 mx-auto mt-35">
          <SupportContact />
        </div> */}
        <div className="flex flex-col h-100 w-100 bg-bdarkgreen mt-50 mx-auto rounded-2xl card overflow-hidden p-2 gap-y-2">
          <div className="flex h-[10%] w-full text-center items-center justify-center">
            <h className="font-extrabold text-2xl">Ask us a question.</h>
          </div>

          <div className="h-[80%] w-full">
            <textarea className="bg-black/50 w-full h-full rounded-2xl p-3"></textarea>

          </div>

          <div className="w-full h-[10%]">
            <button className="h-full w-fit bg-bblue p-2 rounded-2xl  hover:outline-2 balatro active:scale-90"><p>submit</p></button>

          </div>

        </div>
    </div>
  );
}

export default support