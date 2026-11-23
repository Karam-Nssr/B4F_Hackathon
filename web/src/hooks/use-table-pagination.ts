"use client";

import { useState } from "react";

export const DEFAULT_TABLE_PAGE_SIZE = 10;

const useTablePagination = <T>(
  items: T[],
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageItems: items.slice(startIndex, startIndex + pageSize),
    resetPage: () => setPage(1),
    setPage,
    totalItems: items.length,
    totalPages,
  };
};

export default useTablePagination;
