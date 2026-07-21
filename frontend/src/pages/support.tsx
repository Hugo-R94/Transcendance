import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";
import SupportContact from "../components/supportContact";
import ErrorNotLogin from "../components/ErrorNotLogin";

function support() {
  const login = true;

  let content;

  if (login) {
    content = (
      <div className="sm:w-1/2 w-[90%] sm:h-125 h-150 mx-auto mt-35">
        <SupportContact />
      </div>
    );
  } else {
    content = <ErrorNotLogin/>
  }

  return (
    <div className="relative min-h-screen items-center justify-center">
      <ShaderBackground />
      <NavBar />
      {content}
    </div>
  );
}

export default support