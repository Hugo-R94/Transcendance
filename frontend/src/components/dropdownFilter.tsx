import { useEffect, useRef, useState } from "react";

type MenuItem = {
  label: string;
  value: string;
};

type DropdownMenuProps = {
  items: MenuItem[];
  color: string;
  className?: string;
  menuClassName?: string;
  Name?: string;
  value?: string;
  neutralValue?: boolean;
  pos?: -1 | 1; // -1 pour ouverture vers le haut, 1 (ou défaut) pour le bas
  onChange: (value: string) => void;
};

const colors = [
  "bg-bblue",
  "bg-bred",
  "bg-bgreen",
  "bg-byellow",
];

const buttonClass = `
  w-full
  flex
  items-center
  justify-center
  px-4
  py-3
  rounded-2xl
  text-white
  font-bold
  balatro
  shadow-md
  shadow-black/75
  hover:outline-3
  hover:outline-white
  hover:brightness-110
  transition
  shrink-0
`;

function DropdownMenu({
  items,
  color,
  className = "",
  menuClassName = "",
  Name,
  value,
  neutralValue = true,
  pos = 1,
  onChange,
}: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Empêcher le scroll du body en arrière-plan sur mobile quand le menu est ouvert
  useEffect(() => {
    if (!neutralValue) return;

    if (menuOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, neutralValue]);

  const selectedItem = items.find((item) => item.value === value);

  // Gestion dynamique du positionnement sur desktop selon la prop pos
  const positionClasses =
    pos === -1
      ? "sm:top-auto sm:bottom-[calc(100%+0.5rem)]" // Ouverture vers le HAUT
      : "sm:top-[calc(100%+0.5rem)] sm:bottom-auto"; // Ouverture vers le BAS

  // Gestion de la rotation de la flèche (inversée si pos === -1)
  const getArrowRotation = () => {
    if (pos === -1) {
      return menuOpen ? "rotate-180" : "rotate-0"; // Flèche ▲ par défaut, tourne vers le bas au clic
    }
    return menuOpen ? "rotate-180" : "rotate-0";
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bouton de déclenchement */}
      <div
        className={`rounded-2xl ${color} balatro outline-white hover:outline-2`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex w-fit items-center justify-between bg-transparent px-4 py-3 cursor-pointer"
        >
          <span className="font-bold text-white truncate mr-2">
            {selectedItem?.label ?? Name ?? items[0]?.label}
          </span>

          <span
            className={`text-xs text-white transition-transform duration-200 shrink-0 ${getArrowRotation()}`}
          >
            {pos === -1 ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {/* Popover / Menu déroulant */}
      <div
        className={`
          /* Positionnement Mobile First (centré / plein écran adaptatif) */
          fixed left-4 right-4 top-1/2 -translate-y-1/2
          
          /* Switch vers Desktop (positionnement haut/bas dynamique) */
          sm:absolute sm:left-auto sm:right-0 sm:translate-y-0
          sm:w-64
          ${positionClasses}

          z-25
          flex
          flex-col
          gap-2.5
          rounded-xl
          bg-bdarkgreen
          p-4
          card
          shadow-xl
          shadow-black/80
          overflow-y-auto
          overscroll-contain
          max-h-[75vh] sm:max-h-[28rem]
          transition-all
          duration-200
          ease-out
          ${
            menuOpen
              ? "scale-100 opacity-100 pointer-events-auto"
              : "scale-95 opacity-0 pointer-events-none"
          }
          ${menuClassName}
        `}
      >
        {/* Affiche le bouton neutre UNIQUEMENT si Name est fourni */}
        {Name && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setMenuOpen(false);
            }}
            className={`${buttonClass} bg-byellow`}
          >
            {Name}
          </button>
        )}

        {/* Liste des options */}
        {items.map((item, index) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              onChange(item.value);
              setMenuOpen(false);
            }}
            className={`${buttonClass} ${colors[index % colors.length]}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;