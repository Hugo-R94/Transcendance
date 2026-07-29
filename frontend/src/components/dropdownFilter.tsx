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
  Name: string;
  value?: string;
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
  py-5
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
`;

function DropdownMenu({
  items,
  color,
  className = "",
  menuClassName = "",
  Name,
  value,
  onChange,
}: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedItem = items.find((item) => item.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        className={`rounded-2xl ${color} balatro outline-white hover:outline-2`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex w-full items-center justify-between bg-transparent px-2 py-2 cursor-pointer"
        >
          <span className="font-bold text-white">
            {selectedItem?.label ?? Name}
          </span>

          <span
            className={`ml-3 text-xs text-white transition-transform duration-200 ${
              menuOpen ? "translate-y-0.5 rotate-180" : ""
            }`}
          >
            ▲
          </span>
        </button>
      </div>

      <div
        className={`
          absolute
          right-0
          top-[calc(100%+0.5rem)]
          z-50
          flex
          w-full
          sm:w-64
          flex-col
          gap-2
          rounded-xl
          bg-bdarkgreen
		  h-100
          p-6 card
          shadow-lg
          shadow-black/75
          origin-top
          overflow-y-auto
          overscroll-contain
          max-h-[min(34rem,calc(100vh-6rem))]
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

        {items.map((item, index) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              onChange(item.value);
              setMenuOpen(false);
            }}
            className={`${buttonClass} justify-center items-center  ${
              colors[index % colors.length]
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;