import axios from 'axios';
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
