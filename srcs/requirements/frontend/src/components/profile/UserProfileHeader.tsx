import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { getTitleLabel } from "./titleManager";

interface UserProfileHeaderProps {
  profile: {
    username: string;
    description: string;
    title_1: string;
    title_2: string;
  };
  imageSrc: string;
}

export function UserProfileHeader({ profile, imageSrc }: UserProfileHeaderProps) {
  const { t } = useTranslation();
  const label1 = getTitleLabel(profile.title_1);
  const label2 = getTitleLabel(profile.title_2);

  return (
    <>
      {/* -------------------- VERSION DESKTOP -------------------- */}
 	<div className="hidden sm:flex mt-3 w-full gap-3 h-32 lg:h-36 p-2 flex-shrink-0 min-h-0 min-w-0">        <div className="bg-gray-400 h-full aspect-square rounded-full ms-5 shadow-md shadow-black overflow-hidden outline-3 outline-white">
          <img className="w-full h-full object-cover" src={imageSrc} alt={t("userProfileHeader.pictureAlt", { username: profile.username })} />
        </div>

        <div className="flex flex-col justify-center flex-shrink-0 p-1 text-start">
          <div className="h-full w-fit flex items-center gap-x-2">
              <p className="font-bold text-md text-gray-300 whitespace-nowrap">
                {profile.username}
              </p>
              <p className="font-bold text-xs text-gray-300/75 whitespace-nowrap">LVL.{profile.level}</p>
          </div>
          <p className="font-semibold text-sm text-gray-300/75">
            {label1} {label2}
          </p>
        </div>

        <div className="flex-1 bg-black/50 rounded-2xl shadow-md shadow-black p-3 backdrop-blur-md overflow-auto">
          <p className="font-bold md:text-md text-sm text-gray-300 mb-1">{t("profileHeader.aboutMe")}</p>
          <p className="text-gray-300/90 whitespace-pre-wrap">
            {profile.description || t("userProfileHeader.noDescription")}
          </p>
        </div>
      </div>

      {/* -------------------- VERSION MOBILE -------------------- */}
      <div className="sm:hidden flex flex-col w-full">
        <div className="bg-black w-[50%] mt-25 mx-auto overflow-hidden aspect-square rounded-full shadow-md shadow-black/75 outline-5 outline-white">
          <img className="w-full h-full object-cover" src={imageSrc} alt={t("userProfileHeader.pictureAlt", { username: profile.username })} />
        </div>

        <div className="bg-bgreen p-3 mx-auto mt-3 w-fit h-fit rounded-2xl shadow-black shadow-md text-center">
          <p className="font-bold text-2xl text-white">{profile.username}</p>
          <p className="text-white/50 text-lg">
            {label1} {label2 ? `• ${label2}` : ""}
          </p>
        </div>

        <div className="bg-black/50 w-[90%] mx-[5%] h-fit p-3 rounded-2xl shadow-md shadow-black/70 my-3">
          <p className="text-white text-xl font-bold">{t("profileHeader.aboutMe")}</p>
          <p className="text-white/75 whitespace-pre-wrap mt-1">
            {profile.description || t("userProfileHeader.noDescription")}
          </p>
        </div>
      </div>
    </>
  );
}