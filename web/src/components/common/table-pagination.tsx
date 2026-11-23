"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import getPaginationPages from "@/utils/get-pagination-pages";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/hooks/use-table-pagination";

interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  totalPages: number;
}

const TablePagination = ({
  currentPage,
  onPageChange,
  totalItems,
  totalPages,
}: TablePaginationProps) => {
  const firstItem =
    totalItems === 0 ? 0 : (currentPage - 1) * DEFAULT_TABLE_PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * DEFAULT_TABLE_PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:text-gray-400">
      <p aria-live="polite">
        {totalItems === 0
          ? "لا توجد نتائج"
          : `عرض ${firstItem}–${lastItem} من ${totalItems}`}
      </p>
      {totalPages > 1 && (
        <Pagination
          dir="rtl"
          aria-label="التنقل بين صفحات الجدول"
          className="mx-0 w-auto justify-end"
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="السابق"
                disabled={currentPage === 1}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
            {getPaginationPages(currentPage, totalPages).map((page) => (
              <PaginationItem key={page}>
                {typeof page === "number" ? (
                  <PaginationLink
                    href="#"
                    size="icon"
                    isActive={page === currentPage}
                    aria-label={`الصفحة ${page}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                text="التالي"
                disabled={currentPage === totalPages}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TablePagination;
