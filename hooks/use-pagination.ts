export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
}: {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
}) {
  const pages: number[] = [];
  const half = Math.floor(paginationItemsToDisplay / 2);
  let startPage = Math.max(1, currentPage - half);
  const endPage = Math.min(totalPages, startPage + paginationItemsToDisplay - 1);

  if (endPage - startPage + 1 < paginationItemsToDisplay) {
    startPage = Math.max(1, endPage - paginationItemsToDisplay + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const showLeftEllipsis = startPage > 1;
  const showRightEllipsis = endPage < totalPages;

  return { pages, showLeftEllipsis, showRightEllipsis };
}