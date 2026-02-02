// Generic pagination interfaces

export interface PaginationParams {
    pageNumber: number;
    pageSize: number;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
