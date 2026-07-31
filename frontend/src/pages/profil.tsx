import { useEffect, useState } from "react";
import DropdownFilter from "../components/dropdownFilter";
import TitleManager from "../components/titleManager";

type UserProfile = {
  username: string;
  description: string;
  title_1: string;
  title_2: string;
};

type MenuOption = {
  label: string;
  value: string;
};

function Profil() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuOption = "genre";

  const menuOptions: MenuOption[] = [
    { label: "PROFIL", value: "profil" },
    { label: "GAMES", value: "game" },
    { label: "CLICKER", value: "clicker" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Non authentifié");
          return;
        }

        const response = await fetch("http://localhost:8080/api/v1/profil", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-bold">
        Chargement du profil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        {error || "Profil introuvable"}
      </div>
    );
  }

  const userDescription =
    profile.description.trim() !== ""
      ? profile.description
      : "No description yet";

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="hidden sm:flex-1 sm:flex flex-col mx-[5%] w-[90%] pt-22 pb-4">
        <div className="hidden sm:flex mt-3 w-full gap-3 lg:aspect-[12/1] sm:aspect-[8/1] p-2">
          <div className="bg-gray-400 h-full aspect-square rounded-full ml-5 shadow-md shadow-black overflow-hidden outline-3 outline-white">
            <img
              src="https://thispersondoesnotexist.com/random-person.jpeg"
              alt="Profil"
            />
          </div>

          <div className="flex flex-col justify-center flex-shrink-0 p-1 text-left">
            <p className="font-bold text-md text-gray-300 whitespace-nowrap">
              {profile.username}
            </p>

            <TitleManager
              initialTitle1={profile.title_1}
              initialTitle2={profile.title_2}
            />
          </div>

          <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black p-3 overflow-auto backdrop-blur-md">
            <p className="font-bold md:text-md text-sm text-gray-300">
              ABOUT ME :
            </p>

            <p className="text-gray-300/90">{userDescription}</p>
          </div>
        </div>

        <div className="flex gap-3 my-3 h-15 rounded-2xl bg-[#334b4d] shadow-md shadow-black/75 text-white p-2">
          <button className="flex-1 bg-bblue rounded-2xl">
            PROFIL
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-byellow rounded-2xl">
            GAMES
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bred rounded-2xl">
            REVIEWS
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bgreen rounded-2xl">
            FRIENDS
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-bblue rounded-2xl">
            GAMBLES
          </button>

          <div className="w-px bg-white/10" />

          <button className="flex-1 bg-byellow rounded-2xl">
            CLICKER
          </button>
        </div>

        <div className="flex-1 bg-black/50 rounded-2xl my-2 overflow-auto" />
      </main>

      <div className="sm:hidden flex flex-col w-full min-h-screen">
        <div className="bg-black w-[50%] mt-25 mx-auto overflow-hidden aspect-square rounded-full shadow-md shadow-black/75 outline-5 outline-white">
          <img
            src="https://thispersondoesnotexist.com/random-person.jpeg"
            alt="Profil"
          />
        </div>

        <div className="bg-bgreen p-3 mx-auto mt-3 w-fit rounded-2xl shadow-black shadow-md">
          <p className="font-bold text-2xl text-white">
            {profile.username}
          </p>

          <TitleManager
            initialTitle1={profile.title_1}
            initialTitle2={profile.title_2}
          />
        </div>

        <div className="bg-black/50 w-[90%] mx-[5%] h-fit p-3 rounded-2xl shadow-md shadow-black/70 my-3">
          <p className="text-white text-xl font-bold">ABOUT ME :</p>
          <p className="text-white/75">{userDescription}</p>
        </div>

        <DropdownFilter
          className="bg-bred w-[80%] mx-auto h-fit my-3 rounded-2xl shadow-black shadow-md"
          Name="SELECTION"
          color="bg-bred"
          items={menuOptions}
          value={menuOption}
        />

        <div className="bg-black/50 rounded-2xl mt-5 w-[95%] mx-auto h-200 mb-5" />
      </div>
    </div>
  );
}

export default Profil;