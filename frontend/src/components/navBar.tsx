import { useState, useRef, useEffect } from "react";

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
    <div className="flex items-center bg-[#334b4d] w-[90%] sm:h-18 h-15 inset-0 p-1.5 fixed rounded-lg my-4 mx-auto shadow-sm shadow-black  ">
    
	  <a href="https://c.tenor.com/x8v1oNUOmg4AAAAd/tenor.gif" className="h-full  ">
        <button className="flex items-center justify-center h-full w-30 bg-[#00509f] balatro mx-2 ml-1.5 rounded-2xl shadow-sm shadow-black hover:outline-2 hover:outline-white active:scale-90">
          <p className="m-auto font-extrabold sm:text-2xl text-xs transition">
            <span className="text-white">Click</span>
            <span className="text-[#ef4639]">Bet</span>
          </p>
        </button>
      </a>

      <div className="relative balatro m-auto h-10 rounded-lg group hover:outline-2 hover:outline-white active:scale-90 active:rotate-3">
        <input
          className="w-full p-1 h-full rounded-lg bg-[#ed8a00] pr-5 pl-2 focus:bg-[#ffaa00] focus:outline-0 shadow-xs text-gray-800 shadow-black focus:shadow-sm focus:text-shadow-current"
          type="text"
          placeholder="Search..."
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 size-6 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 opacity-50 transition-opacity group-focus-within:opacity-20 hover:scale-105 hover:opacity-75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      <div className="balatro hidden hover:outline-2 hover:outline-white sm:flex items-center justify-center bg-[#fb4740] w-30 h-full ml-1.5 rounded-lg shadow-sm shadow-black active:scale-90">
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
      </div>

      <button className="balatro hidden hover:outline-2 hover:outline-white sm:flex items-center justify-center bg-[#3c9b71] w-30 h-full ml-1.5 rounded-lg shadow-sm shadow-black active:scale-90">
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
      </button>

      <div className="relative flex balatro  hover:outline-2 hover:outline-white h-full w-30 ml-1.5" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center bg-[#00509f] w-30 h-full rounded-lg shadow-sm shadow-black"
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
          <div className="absolute right-0 top-[110%] w-56  origin-top-right rounded-md bg-[#fb4740] outline-1 -outline-offset-1 outline-white/10 shadow-lg overflow-hidden z-50">
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
      </div>
    </div>
  );
}

export default NavBar;