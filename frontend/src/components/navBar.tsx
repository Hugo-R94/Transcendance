import { useState, useRef, useEffect } from "react";
import SearchBar from "./searchBar";
import ButtonLink from "./buttonLink";
import DropdownMenu from "./DropdownMenu";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center bg-bdarkgreen w-[90%] sm:h-18 h-15 inset-0 p-1.5 fixed rounded-lg my-4 mx-auto shadow-sm shadow-black z-9999  ">
    
	<ButtonLink link="http://localhost:5173/games" color="bg-[#00509f]" className="m-auto font-extrabold lg:text-xl md:text-sm sm:text-sm text-xs transition mr-5" >
	    <p >
            <span className="text-white">Click</span>
            <span className="text-[#ef4639]">Bet</span>
        </p>
	</ButtonLink>

      <div className="relative overflow-visible m-auto h-10 rounded-lg group hover:outline-2 hover:outline-white active:scale-90 ">
		<SearchBar></SearchBar>
      </div>
	  
	<ButtonLink link="http://localhost:5173/clicker" color="bg-[#fb4740]" className="hidden sm:flex">
			<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="stroke-white sm:size-8 size-12"
			>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
			/>
			</svg>
			<p className="my-auto text-xl text-white sm:inline hidden font-bold">Gamble</p>
	</ButtonLink>
		
	<ButtonLink link="http://localhost:5173/profil" color="bg-[#3c9b71]" className="hidden sm:flex">
		<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="stroke-white sm:size-8 size-12"
	>
		<path
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
		/>
	</svg>
	<p className="mr-5 my-auto text-white text-xl sm:inline hidden font-bold">Profil</p>
	</ButtonLink>

      {/* <div className="relative flex    h-full w-30 ml-3" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center balatro hover:outline-2 hover:outline-white bg-[#00509f] w-30 h-full rounded-lg shadow-black shadow-sm "
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
          <p className="mr-3 my-auto text-xl text-white sm:inline hidden font-bold">Menu</p>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[110%] w-56  origin-top-right rounded-md bg-[#fb4740] outline-1 overflow-visble -outline-offset-1 outline-white/10 shadow-lg overflow-hidden z-50">
            <div className="py-1">
              <a href="#" className="balatro block px-4 py-2 text-sm bg-[#fb4740] text-gray-300 hover:bg-[#ed8a00] hover:text-white focus:bg-[#ed8a00] focus:text-white focus:outline-hidden">
                Account settings
              </a>
              <a href="#" className="balatro block px-4 py-2 text-sm bg-[#fb4740] text-gray-300 hover:bg-[#ed8a00] hover:text-white focus:bg-[#ed8a00] focus:text-white focus:outline-hidden">
                Support
              </a>
              <a href="#" className="balatro block px-4 py-2 text-sm bg-[#fb4740] text-gray-300 hover:bg-[#ed8a00] hover:text-white focus:bg-[#ed8a00] focus:text-white focus:outline-hidden">
                License
              </a>
              <form action="#" method="POST">
                <button
                  type="submit"
                  className="balatro bg-[#fb4740] block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#ed8a00] hover:text-white focus:bg-[#ed8a00] focus:text-white focus:outline-hidden"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div> */}
		<DropdownMenu
		className=" rounded-2xl ml-3 shadow-black/50 shadow-md 
			sm:w-[10%]
			w-20
			flex
			items-center
			justify-center
			h-full
		"
		color="bg-bred"
		items={[
			{ label: "Home", href: "/" },
			{ label: "Profil", href: "/profil" },
			{ label: "Support", href: "/support" },
			{ label: "Logout", href: "/logout" },
		]}
		>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-8 shrink-0 stroke-white"
		>
			<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
			/>
		</svg>

		<p className="
		hidden
		lg:block
		text-white
		font-bold
		text-xl
		whitespace-nowrap
		">
			MENU
			</p>
		</DropdownMenu>
	</div>
  );
}

export default NavBar;