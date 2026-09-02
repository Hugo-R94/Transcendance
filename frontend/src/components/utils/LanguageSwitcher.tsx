import { useTranslation } from "react-i18next";
import DropdownMenu from "./DropdownMenu";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const items = LANGUAGES.map((lang) => ({
    label: lang.label,
    onClick: () => i18n.changeLanguage(lang.code),
  }));

  const current =
    LANGUAGES.find((l) => l.code === i18n.language)?.label ?? "EN";

  return (
    <DropdownMenu className="z-100" items={items} color="bg-bblue">
      <span className="px-2 py-1 rounded-md bg-bblue text-white font-bold text-sm">
        {current}
      </span>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;