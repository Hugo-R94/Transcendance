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
    <div className="w-full mt-5 flex justify-center items-center">

      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="balatro hover:outline-2 hover:outline-white active:scale-90 rounded-lg bg-black/40 px-4 py-2 disabled:opacity-30 mr-3"
      >
        Précédent
      </button>

      <span>
        Page
      </span>

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
        className="bg-black/40 h-full mx-2 text-center rounded-2xl w-14 p-1 no-spinner"
      />

      <span>
        / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="balatro hover:outline-2 hover:outline-white active:scale-90 rounded-lg bg-black/40 px-4 py-2 disabled:opacity-30 ml-3"
      >
        Suivant
      </button>

    </div>
  );
}

export default Pagination;