import NavBar from "../components/utils/navBar";
import SupportContact from "../components/supportContact";

function support() {
  return (
    <div className="relative min-h-screen items-center justify-center">
      <NavBar />
	  <div className="sm:w-1/2 w-[90%] sm:h-125 h-150 mx-auto mt-35">
        <SupportContact />
      </div>
    </div>
  );
}

export default support