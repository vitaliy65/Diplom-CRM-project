import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export type ShowTablePageProps = {
  totalRows: number;
  currentPage: number;
  rowsPerPage: number;
  pageSizeOptions?: number[];
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
  className?: string;
};

export default function ShowTablePage({
  totalRows,
  currentPage,
  rowsPerPage,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onChangePage,
  onChangeRowsPerPage,
  className = "",
}: ShowTablePageProps) {
  const [gotoPageValue, setGotoPageValue] = React.useState("");

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = Number(e.target.value);
    onChangeRowsPerPage(newVal);
  };

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    onChangePage(clamped);
  };

  const handleGotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGotoPageValue(e.target.value);
  };

  const handleGotoSubmit = () => {
    const page = Number(gotoPageValue);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
      setGotoPageValue("");
    }
  };

  // Generate page buttons (show: first, current-1, current, current+1, last)
  const getPageButtons = () => {
    const btns: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) btns.push(i);
    } else {
      btns.push(1);
      if (currentPage > 3) btns.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        btns.push(i);
      }
      if (currentPage < totalPages - 2) btns.push("ellipsis");
      btns.push(totalPages);
    }
    return btns;
  };

  return (
    <div
      className={
        "flex items-center bg-card border rounded-lg shadow px-4 py-2 h-14 gap-4 text-sm text-foreground justify-between " +
        className
      }
    >
      {/* Rows per page */}
      <div className="flex h-full items-center justify-center gap-1">
        <span className="text-muted-foreground">Showing per page</span>
        <select
          className="ml-1 bento-card  cursor-pointer rounded-md! aspect-square border px-2 py-1 bg-background appearance-none focus:outline-none"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination controls */}
      <div className="flex h-full items-center gap-1">
        <button
          className="bento-card cursor-pointer rounded-md! aspect-square h-full border px-2 py-1 bg-background hover:bg-accent disabled:opacity-50"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          className="bento-card cursor-pointer rounded-md! aspect-square h-full border px-2 py-1 bg-background hover:bg-accent disabled:opacity-50"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageButtons().map((btn, idx) =>
          btn === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="mx-1 text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={btn}
              className={
                "bento-card cursor-pointer rounded-md! aspect-square h-full border px-2 py-1 " +
                (btn === currentPage
                  ? "text-white font-semibold bg-secondary-foreground!"
                  : "")
              }
              onClick={() => goToPage(Number(btn))}
              disabled={btn === currentPage}
            >
              {btn}
            </button>
          ),
        )}
        <button
          className="bento-card  cursor-pointer rounded-md! aspect-square h-full border px-2 py-1 bg-background hover:bg-accent disabled:opacity-50"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          className="bento-card  cursor-pointer rounded-md! aspect-square h-full border px-2 py-1 bg-background hover:bg-accent disabled:opacity-50"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Go to page */}
      <div className="flex h-full items-center gap-1">
        <span className="text-muted-foreground whitespace-nowrap">
          Go to page
        </span>
        <input
          type="text"
          min={1}
          value={gotoPageValue}
          onChange={handleGotoInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGotoSubmit();
          }}
          className="w-14 bento-card rounded-md! flex h-full border px-1.5 py-0.5 bg-background focus:outline-none"
        />
        <button
          className="bento-card cursor-pointer rounded-md! aspect-square h-full border px-2 py-0.5 bg-background hover:bg-accent"
          onClick={handleGotoSubmit}
          disabled={
            !gotoPageValue ||
            isNaN(Number(gotoPageValue)) ||
            Number(gotoPageValue) < 1 ||
            Number(gotoPageValue) > totalPages
          }
        >
          Go
        </button>
      </div>
    </div>
  );
}
