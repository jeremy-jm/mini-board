import axios from 'axios';


export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const text =
      error?.response?.data?.message ||
      error?.message ||
      'Request failed';
    void import('antd').then(({ message }) => {
      message.error(String(text));
    });
    return Promise.reject(error);
  },
);

