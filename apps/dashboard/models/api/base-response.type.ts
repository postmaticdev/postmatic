import type { AxiosError, AxiosResponse } from "axios";
import { z } from "zod";

export interface BaseResponse<T = unknown> {
  metaData: MetaData;
  responseMessage: string;
  data: T;
}

export interface MetaData {
  code: number;
  message: string;
}

export type AxiosOk<T> = AxiosResponse<BaseResponse<T>>;
export type ApiErr = AxiosError<BaseResponse<unknown>>;

export interface BaseResponseFiltered<T = unknown> {
  metaData: MetaData;
  responseMessage: string;
  data: T;
  pagination: Pagination;
  filterQuery: FilterQuery;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FilterQuery {
  dateStart: string;
  dateEnd: string;
  search: string;
  page: number;
  limit: number;
  sort: string;
  skip: number;
  sortBy: string;
  category: string;
}

export const initialPagination: Pagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};
