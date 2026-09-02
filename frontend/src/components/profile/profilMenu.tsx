import { useState } from "react";
import { useTranslation } from "react-i18next";
import DropdownFilter from "../utils/dropdownFilter";

type ProfileMenuProps = {
  activeTab?: string;
  onTabChange?: (tabValue: string) => void;
};

export default function ProfileMenu({ activeTab = "profil", onTabChange }: ProfileMenuProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const MENU_OPTIONS = [
    { label: t("profileMenu.games"), value: "game", color: "bg-bblue" },
    { label: t("profileMenu.reviews"), value: "reviews", color: "bg-byellow" },
    { label: t("profileMenu.friends"), value: "friends", color: "bg-bred" },
    { label: t("profileMenu.gambles"), value: "gambles", color: "bg-bgreen" },
  ];

  const handleSelect = (value: string) => {
    setSelectedTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <>
      {/* -------------------- VERSION DESKTOP / GRAND ÉCRAN -------------------- */}
      <div className="hidden sm:flex gap-3 my-3 h-15 rounded-2xl bg-[#334b4d] shadow-md shadow-black/75 text-white p-2">
        {MENU_OPTIONS.map((option, index) => {
          const isActive = selectedTab === option.value;
          return (
            <div key={option.value} className="flex-1 flex items-center">
              <button
                onClick={() => handleSelect(option.value)}
                className={`w-full h-full rounded-2xl font-bold transition-all shadow-md shadow-black cursor-pointer balatro ${
                  option.color
                } ${isActive ? "ring-2 ring-white scale-[1.02]" : "hover:z-150"}`}
              >
                {option.label}
              </button>
              {index < MENU_OPTIONS.length - 1 && (
                <div className="w-px h-full bg-white/10 ml-3" />
              )}
            </div>
          );
        })}
      </div>

      {/* -------------------- VERSION MOBILE -------------------- */}
      <div className="sm:hidden w-[80%] mx-auto my-3">
        <DropdownFilter
          className="bg-bred w-full h-fit z-25 active:z-150 rounded-2xl shadow-black shadow-md"
          color="bg-bred"
          items={MENU_OPTIONS}
          value={selectedTab}
          onChange={(value) => handleSelect(value)}
        />
      </div>
    </>
  );
}