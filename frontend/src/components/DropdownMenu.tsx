import { useEffect, useRef, useState, ReactNode } from "react";

export type MenuItem = {
  label: string;
  href?: string;
  onClick?: () => void; // Ajout du callback onClick optionnel
};

type DropdownMenuProps = {
  items: MenuItem[];
  children: ReactNode;
  className?: string;
  menuClassName?: string;
  color: string;
};

const colors = [
  "bg-bblue",
  "bg-bred",
  "bg-bgreen",
  "bg-byellow",
  "bg-bdarkgreen",
];

function DropdownMenu({
  items,
  children,
  className = "",
  menuClassName = "",
  color,
}: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: MenuItem) => {
    // 1. Fermer le menu
    setMenuOpen(false);

    // 2. Exécuter l'action personnalisée si elle existe
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Wrapper bouton principal */}
      <div className={`w-full h-full rounded-2xl ${color} balatro outline-white hover:outline-2`}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-full h-full flex items-center justify-center appearance-none border-none p-0 bg-transparent cursor-pointer"
        >
          {children}
        </button>
      </div>

      {/* Menu déroulant */}
      {menuOpen && (
        <div
          className={`flex flex-col gap-y-2 absolute right-0 top-[110%] sm:w-100 w-[500%] mt-2 rounded-xl overflow-visible shadow-lg p-3 bg-bdarkgreen z-50 ${menuClassName}`}
        >
          {items.map((item, index) => {
            const itemStyles = `
              block w-full text-left px-4 py-3 text-white font-bold transition
              hover:brightness-110 shadow-black/75 shadow-md rounded-2xl
              hover:outline-3 hover:outline-white balatro cursor-pointer
              ${colors[index % colors.length]}
            `;

            // Si c'est un bouton avec action (ex: Logout)
            if (item.onClick) {
              return (
                <button
                  key={index}
                  type="button"
                  className={itemStyles}
                  onClick={() => handleItemClick(item)}
                >
                  {item.label}
                </button>
              );
            }

            // Si c'est une redirection simple
            return (
              <a
                key={index}
                href={item.href ?? "#"}
                className={itemStyles}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;