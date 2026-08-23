import NavBar from "../components/navBar";
import ShaderBackground from "../components/shaderBG";
import Gambling from "../components/gambling";
// import Gambling from "../components/gambtest";
function Clicker() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <NavBar />

      <div className="relative flex min-h-0 flex-1">
        <ShaderBackground />

        <main className="relative z-10 mt-25 flex min-h-0 w-full flex-1 px-6">
          <div className="mx-auto flex min-h-0 w-full max-w-[2000x] flex-1 gap-5 py-5">

            {/* JEU */}
            <div className="min-h-0 sm:w-[80%] w-full overflow-hidden rounded-2xl bg-bdarkgreen card">
              <Gambling />
            </div>

            {/* LEADERBOARD */}
            <div className="min-h-0 sm:w-[20%] w-0 overflow-y-auto rounded-2xl bg-bdarkgreen p-3 card sm:visible invisible">
              <h2 className="font-black text-white">
                LEADERBOARD
              </h2>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Clicker;
