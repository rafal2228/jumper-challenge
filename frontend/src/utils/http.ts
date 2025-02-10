import axios, { isAxiosError, AxiosError } from 'axios';
import { env } from '../env';

export const http = axios.create({
  baseURL: env.apiUrl,
});

export const authHttp = axios.create({
  baseURL: env.apiUrl,
});

export type APIResponse<T> = {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
};

export const isAPIError = (error: unknown): error is AxiosError<APIResponse<unknown>> => {
  if (!isAxiosError(error)) {
    return false;
  }

  const data = error.response?.data;

  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    !data.success &&
    'message' in data &&
    typeof data.message === 'string'
  );
};
