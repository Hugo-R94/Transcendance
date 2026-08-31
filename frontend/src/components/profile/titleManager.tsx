import { useEffect, useState } from "react";
import DropdownMenu from "../utils/dropdownFilter";
import { setUserTitle } from "../../api/profilApi";


export type TitleOption = {
  label: string;
  value: number;
};

// La liste autorisée côté front (IDs identiques au Backend)
export const TITLE_OPTIONS: TitleOption[] = [
  { label: "Gamer", value: 1 },
  { label: "Puant", value: 2 },
  { label: "Hardstuck", value: 3 },
  { label: "High", value: 4 },
  { label: "Lucky", value: 5 },
  { label: "Endetté", value: 6 },
  { label: "Master", value: 7 },
  { label: "Inter", value: 8 },
  { label: "New", value: 9 },
  { label: "Player", value: 10 },
];

/**
 * Helper exporté pour convertir un ID (numérique ou string) en son libellé texte.
 */
export function getTitleLabel(id: string | number): string {
  const num = Number(id);
  const found = TITLE_OPTIONS.find((opt) => opt.value === num);
  return found ? found.label : "";
}

interface TitleManagerProps {
  initialTitle1?: string | number;
  initialTitle2?: string | number;
  onSelectTitle1?: (value: number) => void;
  onSelectTitle2?: (value: number) => void;
}

function TitleManager({
  initialTitle1 = 9,
  initialTitle2 = 10,
  onSelectTitle1,
  onSelectTitle2,
}: TitleManagerProps) {
  // Conversion explicite en number pour le state local
  const [selectedTitle1, setSelectedTitle1] = useState<number>(Number(initialTitle1));
  const [selectedTitle2, setSelectedTitle2] = useState<number>(Number(initialTitle2));

  // Synchronisation si les props sont mises à jour après un fetch API du Profil
  useEffect(() => {
    if (initialTitle1 !== undefined) setSelectedTitle1(Number(initialTitle1));
    if (initialTitle2 !== undefined) setSelectedTitle2(Number(initialTitle2));
  }, [initialTitle1, initialTitle2]);

  const handleTitle1Change = async (newValueStr: string) => {
    const numericValue = Number(newValueStr);
    setSelectedTitle1(numericValue);

    try {
      await setUserTitle(1, numericValue);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du titre 1 :", err);
    }

    if (onSelectTitle1) onSelectTitle1(numericValue);
  };

  const handleTitle2Change = async (newValueStr: string) => {
    const numericValue = Number(newValueStr);
    setSelectedTitle2(numericValue);

    try {
      await setUserTitle(2, numericValue);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du titre 2 :", err);
    }

    if (onSelectTitle2) onSelectTitle2(numericValue);
  };

  // Construction des items pour le dropdown en utilisant getTitleLabel
  const formattedOptions = TITLE_OPTIONS.map((opt) => ({
    label: getTitleLabel(opt.value),
    value: opt.value.toString(),
  }));

  return (
    <div className="flex w-fit min-w-[150px] shrink-0 mt-2">
      <DropdownMenu
        className="w-1/2 text-xs"
        items={formattedOptions}
        value={selectedTitle1.toString()}
        onChange={handleTitle1Change}
        color="bg-bred"
      />

      <DropdownMenu
        className="ml-2 w-1/2 text-xs"
        items={formattedOptions}
        value={selectedTitle2.toString()}
        onChange={handleTitle2Change}
        color="bg-bblue"
      />
    </div>
  );
}

export default TitleManager;