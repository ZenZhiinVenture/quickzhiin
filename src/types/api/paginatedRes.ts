export interface PaginatedResponse<T> {
  data: T[];
  totalItem: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
