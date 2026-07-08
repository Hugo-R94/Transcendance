import { useState, useEffect } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const [inputPage, setInputPage] = useState(String(page));

  // Synchronise l'input si la page change via les boutons ou l'URL
  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  function handlePageSubmit() {
    const newPage = Number(inputPage);

    if (Number.isNaN(newPage)) {
      setInputPage(String(page));
      return;
    }

    if (newPage < 1) {
      onPageChange(1);
      return;
    }

    if (newPage > totalPages) {
      onPageChange(totalPages);
      return;
    }

    onPageChange(newPage);
  }

  return (
  <div className="w-[95%] sm:w-[90%] my-5 flex items-center justify-center gap-1 sm:gap-3 rounded-2xl">
    <button
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      className="hover:-translate-x-3 balatro shrink-0 rounded-lg shadow-md shadow-black bg-black/40 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-base hover:outline-2 hover:outline-white active:scale-90 disabled:opacity-30"
    >
      <span className="hidden sm:inline">Précédent</span>
      <span className="sm:hidden">←</span>
    </button>

    <input
      type="number"
      min={1}
      max={totalPages}
      value={inputPage}
      onChange={(e) => setInputPage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handlePageSubmit();
        }
      }}
      className="bg-black/40 w-8 sm:w-10 p-1 mx-1 sm:mx-2 text-center rounded-xl text-xs sm:text-base no-spinner"
    />

    <span className="text-xs sm:text-base shrink-0">
      / {totalPages}
    </span>

    <button
      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      className="hover:translate-x-5 balatro shrink-0 rounded-lg bg-black/40 px-2 shadow-md shadow-black py-1 text-xs sm:px-4 sm:py-2 sm:text-base hover:outline-2 hover:outline-white active:scale-90 disabled:opacity-30"
    >
      <span className="hidden sm:inline">Suivant</span>
      <span className="sm:hidden">→</span>
    </button>
  </div>
);
}

export default Pagination;