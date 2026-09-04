import React from "react";
import { useTranslation } from "react-i18next";
import TitleManager from "./titleManager";
import type { UserProfile } from "../../pages/profil";

interface ProfileHeaderProps {
  profile: UserProfile;
  imageSrc: string;
  description: string;
  isSavingDesc: boolean;
  onDescriptionChange: (val: string) => void;
  onSaveDescription: () => void;
  onImageChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export function ProfileHeader({
  profile,
  imageSrc,
  description,
  isSavingDesc,
  onDescriptionChange,
  onSaveDescription,
  onImageChange,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const leveluser = profile.level ? profile.level : "unknown";
  return (
    <>
      {/* =====================================================
          DESKTOP
          ===================================================== */}

      <div className="hidden sm:flex mt-3 w-full gap-3 h-32 lg:h-36 p-2 flex-shrink-0 min-w-0">
        <div className="relative bg-gray-400 h-full aspect-square rounded-full ml-5 shadow-md shadow-black overflow-hidden outline-3 outline-white group cursor-pointer bg-byellow flex-shrink-0">
          <img
            className="w-full h-full object-cover group-hover:blur-sm transition-all duration-200"
            src={imageSrc}
            alt={t("profileHeader.pictureAlt")}
          />

          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
              />
            </svg>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        <div className="flex flex-col justify-center flex-shrink-0 p-1 text-left min-w-0">
          <div className="h-full w-fit flex items-center gap-x-2">
          <p className="font-bold text-md text-gray-300 whitespace-nowrap">
            {profile.username}
          </p>
          <p className="font-bold text-xs text-gray-300/75 whitespace-nowrap">LVL.{profile.level}</p>
          </div>

          <TitleManager
            initialTitle1={profile.title_1}
            initialTitle2={profile.title_2}
          />
        </div>

        <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-black/50 rounded-2xl shadow-md shadow-black p-3 backdrop-blur-md">
          <div className="flex justify-between items-center mb-1 flex-shrink-0">
            <p className="font-bold md:text-md text-sm text-gray-300">
              {t("profileHeader.aboutMe")}
            </p>

            <button
              onClick={onSaveDescription}
              disabled={isSavingDesc}
              className="bg-bblue hover:bg-bblue/80 text-white font-bold text-xs px-3 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {isSavingDesc ? t("profileHeader.saving") : t("profileHeader.save")}
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) =>
              onDescriptionChange(e.target.value)
            }
            placeholder={t("profileHeader.descriptionPlaceholder")}
            className="w-full min-h-0 flex-1 bg-transparent text-gray-300/90 focus:outline-none resize-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* =====================================================
          MOBILE
          ===================================================== */}

      <div className="sm:hidden flex flex-col w-full">
        <div className="relative bg-byellow w-[50%] max-w-[260px] mt-20 mx-auto overflow-hidden aspect-square rounded-full shadow-md shadow-black/75 outline-5 group cursor-pointer">
          <img
            className="w-full h-full object-cover group-hover:blur-sm transition-all duration-200"
            src={imageSrc}
            alt={t("profileHeader.pictureAlt")}
          />

          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-sm font-bold">
              {t("profileHeader.changePicture")}
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        <div className="bg-bgreen p-3 mx-auto mt-3 w-fit max-w-[90%] rounded-2xl shadow-black shadow-md text-center">
          <p className="font-bold text-2xl text-white break-words">
            {profile.username}
          </p>

          <TitleManager
            initialTitle1={profile.title_1}
            initialTitle2={profile.title_2}
          />
        </div>

        <div className="bg-black/50 w-[90%] mx-auto min-h-[150px] p-3 rounded-2xl shadow-md shadow-black/70 my-3 flex flex-col gap-2">
          <div className="flex justify-between items-center flex-shrink-0">
            <p className="text-white text-xl font-bold">
              {t("profileHeader.aboutMe")}
            </p>

            <button
              onClick={onSaveDescription}
              disabled={isSavingDesc}
              className="bg-bblue hover:bg-bblue/80 text-white font-bold text-xs px-3 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {isSavingDesc ? t("profileHeader.saving") : t("profileHeader.save")}
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) =>
              onDescriptionChange(e.target.value)
            }
            placeholder={t("profileHeader.descriptionPlaceholder")}
            rows={4}
            className="w-full bg-transparent text-white/75 focus:outline-none resize-none placeholder-gray-500"
          />
        </div>
      </div>
    </>
  );
}