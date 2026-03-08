export function buildPaginatedResult<T>(
  data: T[] | null,
  count: number | null,
  page: number,
  pageSize: number
) {
  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
