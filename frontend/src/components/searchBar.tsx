import { useState, useEffect } from "react";



function SearchBar({}) {
	return (
		<div className="w-full h-full">
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
	);
}

export default SearchBar