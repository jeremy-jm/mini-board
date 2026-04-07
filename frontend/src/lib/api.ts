import axios from 'axios';

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data as ApiErrorPayload | undefined;
    const text =
      payload?.error?.message ??
      payload?.message ??
      error?.message ??
      'Request failed';
    void import('antd/es/message').then(({ default: message }) => {
      message.error(String(text));
    });
    return Promise.reject(error);
  },
);

