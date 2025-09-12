type CreatePaginationParams = {
  total: number;
  page: number;
  limit: number;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export class BaseService {
  protected log(action: string, data?: any) {
    console.log(`[SERVICE LOG]: ${action}`, data ?? "");
  }

  protected handleError(context: string, err: unknown) {
    console.error(`[ERROR in ${context}]`, err);
    throw new Error(
      err instanceof Error ? err.message : "Unexpected service error"
    );
  }

  protected createPagination = ({
    total,
    page,
    limit,
  }: CreatePaginationParams): Pagination => {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  };
}
