import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full h-fit flex flex-col items-center justify-center text-center">
        <p className="text-5xl text-gray-300 font-bold">
          {t("home.welcome")} <span className="text-white">Click</span>
          <span className="text-[#ef4639]">Bet</span>
        </p>

        <h6 className="text-xl text-gray-300/75 mt-2">
          {t("home.tagline")}
        </h6>

        <div className="flex flex-col gap-4 mt-6">
          <Link to="/login">
            <button className="balatro bg-byellow h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
              {t("home.login")}
            </button>
          </Link>
          <Link to="/signin">
            <button className="balatro bg-bred h-15 w-50 rounded-2xl shadow-black/75 shadow-md hover:outline-3 text-xl font-bold">
              {t("home.signup")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;