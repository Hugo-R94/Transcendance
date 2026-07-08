import { useEffect, useRef, useState } from "react";

type MenuItem = {
  label: string;
  href?: string;
};

type DropdownMenuProps = {
  title?: string;
  items: MenuItem[];
};

function DropdownMenu({ title = "Menu", items }: DropdownMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique dehors
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
    <div className="relative flex h-full w-30 ml-3 overflow-visible" ref={dropdownRef}>
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center justify-center balatro hover:outline-2 hover:outline-white bg-[#00509f] w-30 h-full rounded-lg shadow-black shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="stroke-white sm:size-8 size-6 mr-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>

        <p className="mr-3 my-auto text-xl text-white sm:inline hidden font-bold">
          {title}
        </p>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[110%] w-56 rounded-md bg-[#fb4740] outline-1 overflow-visible -outline-offset-1 outline-white/10 shadow-lg z-50">
          <div className="py-1 ">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href ?? "#"}
                className="balatro rounded-2xl hover:z-9999 w-full block px-4 py-2 text-sm bg-[#fb4740] text-gray-300 hover:bg-[#ed8a00] hover:text-white focus:bg-[#ed8a00] focus:text-white focus:outline-hidden"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;