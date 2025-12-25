export interface PaginationOptions {
  page?: number; // Page-based pagination (1-indexed)
  limit?: number; // Items per page
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedMoviesResponse {
  data: any[];
  meta: PaginationMeta;
}
