import { useEffect, useRef, useState, ReactNode } from "react";

type MenuItem = {
  label: string;
  href?: string;
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

  return (
	<div ref={dropdownRef} className={`relative ${className}`}>
	{/* Ce wrapper porte l'effet holo, PAS le positionnement du menu */}
	<div className={` w-full h-full rounded-2xl ${color} balatro outline-white hover:outline-2`}>
		<button
		type="button"
		onClick={() => setMenuOpen((prev) => !prev)}
		className="w-full h-full flex items-center justify-center
					appearance-none border-none p-0 bg-transparent cursor-pointer"
		>
		{children}
		</button>
	</div>

      {menuOpen && (
        <div
          className={`flex flex-col gap-y-2 absolute right-0 top-[110%] sm:w-100 w-[500%] mt-2 rounded-xl overflow-visible shadow-lg p-3 bg-bdarkgreen z-50 ${menuClassName}`}
        >
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href ?? "#"}
              className={`
                block
                px-4
                py-3
                text-white
                font-bold
                transition
                hover:brightness-110
				shadow-black/75 shadow-md rounded-2xl
				hover:outline-3 hover:outline-white
				balatro
                ${colors[index % colors.length]}
              `}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;