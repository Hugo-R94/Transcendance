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

  const selectedItem = items.find((item) => item.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        className={`
          rounded-2xl
          ${color}
          balatro
          outline-white
          hover:outline-2
        `}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="
            w-full
            flex
            items-center
            justify-between
            px-4
            py-3
            bg-transparent
            cursor-pointer
          "
        >
          <span className="text-white font-bold">
            {selectedItem?.label || Name}
          </span>

          <span
            className={`
              text-white
              text-xs
              transition-transform
              duration-200
              ml-3
              ${menuOpen ? "rotate-180 translate-y-0.5" : ""}
            `}
          >
            ▲
          </span>
        </button>
      </div>

      {/* Le menu reste toujours dans le DOM pour permettre l'animation */}
      <div
        className={`
          absolute
          right-0
          top-[110%]
          mt-2
          flex
          flex-col
          gap-2
          rounded-xl
          bg-bdarkgreen
          shadow-lg shadow-black/75
          p-3
          z-50
          sm:w-64
          w-full
          origin-top
          transition-all
          duration-200
          ease-out
          ${
            menuOpen
              ? "scale-100 pointer-events-auto"
              : "scale-0  translate-x-1/2 pointer-events-none"
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
          className="
            w-full
            px-4
            py-3
            rounded-2xl
            text-white
            font-bold
            bg-byellow
            balatro
            shadow-md
            shadow-black/75
            hover:outline-3
            hover:outline-white
            hover:brightness-110
            transition
          "
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
            className={`
              w-full
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
              ${colors[index % colors.length]}
            `}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;