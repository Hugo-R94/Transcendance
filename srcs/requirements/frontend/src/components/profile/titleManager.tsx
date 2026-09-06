import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import DropdownMenu from "../utils/dropdownFilter";
import { setUserTitle } from "../../api/profilApi";

export type TitleOption = {
  value: number;
};

// La liste des IDs autorisés côté front (identiques au Backend)
export const TITLE_OPTIONS: TitleOption[] = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
  { value: 7 },
  { value: 8 },
  { value: 9 },
  { value: 10 },
];

/**
 * Helper exporté pour convertir un ID (numérique ou string) en son libellé texte.
 * Utilise i18n.t() directement (plutôt que useTranslation) car cette fonction
 * est appelée depuis des composants qui n'utilisent pas le hook.
 */
export function getTitleLabel(id: string | number): string {
  const num = Number(id);
  const found = TITLE_OPTIONS.find((opt) => opt.value === num);
  return found ? i18n.t(`titles.${num}`) : "";
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
  const { t } = useTranslation();
  const [selectedTitle1, setSelectedTitle1] = useState<number>(Number(initialTitle1));
  const [selectedTitle2, setSelectedTitle2] = useState<number>(Number(initialTitle2));

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
    }

    if (onSelectTitle1) onSelectTitle1(numericValue);
  };

  const handleTitle2Change = async (newValueStr: string) => {
    const numericValue = Number(newValueStr);
    setSelectedTitle2(numericValue);

    try {
      await setUserTitle(2, numericValue);
    } catch (err) {
    }

    if (onSelectTitle2) onSelectTitle2(numericValue);
  };

  const formattedOptions = TITLE_OPTIONS.map((opt) => ({
    label: t(`titles.${opt.value}`),
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
        className="ms-2 w-1/2 text-xs"
        items={formattedOptions}
        value={selectedTitle2.toString()}
        onChange={handleTitle2Change}
        color="bg-bblue"
      />
    </div>
  );
}

export default TitleManager;